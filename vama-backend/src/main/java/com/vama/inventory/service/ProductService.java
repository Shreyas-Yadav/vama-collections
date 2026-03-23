package com.vama.inventory.service;

import com.vama.catalog.domain.CategoryRepository;
import com.vama.common.exception.ApiException;
import com.vama.common.model.PageQuery;
import com.vama.inventory.domain.Product;
import com.vama.inventory.domain.ProductImage;
import com.vama.inventory.domain.ProductImageRepository;
import com.vama.inventory.domain.ProductRepository;
import com.vama.vendor.domain.VendorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class ProductService {

    private static final Set<String> SORTS = Set.of("name", "sku", "createdAt", "updatedAt", "quantityInStock", "sellingPrice", "costPrice", "gstSlab", "productType");

    private final ProductRepository repository;
    private final ProductImageRepository imageRepository;
    private final CategoryRepository categoryRepository;
    private final VendorRepository vendorRepository;
    private final StockLedgerService stockLedgerService;

    public ProductService(ProductRepository repository, ProductImageRepository imageRepository, CategoryRepository categoryRepository, VendorRepository vendorRepository, StockLedgerService stockLedgerService) {
        this.repository = repository;
        this.imageRepository = imageRepository;
        this.categoryRepository = categoryRepository;
        this.vendorRepository = vendorRepository;
        this.stockLedgerService = stockLedgerService;
    }

    @Transactional(readOnly = true)
    public Page<Product> list(PageQuery query, UUID categoryId, String stockStatus, String productType, UUID vendorId) {
        Specification<Product> spec = (root, q, cb) -> {
            var predicate = cb.conjunction();
            if (query.search() != null && !query.search().isBlank()) {
                String pattern = "%" + query.search().toLowerCase() + "%";
                predicate = cb.and(predicate, cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("sku")), pattern)
                ));
            }
            if (categoryId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("categoryId"), categoryId));
            }
            if (vendorId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("vendorId"), vendorId));
            }
            if (productType != null && !productType.isBlank()) {
                predicate = cb.and(predicate, cb.equal(root.get("productType"), com.vama.common.service.EnumMapper.fromFrontend(com.vama.inventory.domain.ProductType.class, productType)));
            }
            if ("LOW_STOCK".equalsIgnoreCase(stockStatus)) {
                predicate = cb.and(predicate, cb.and(cb.greaterThan(root.get("quantityInStock"), 0), cb.lessThanOrEqualTo(root.get("quantityInStock"), root.get("lowStockThreshold"))));
            } else if ("OUT_OF_STOCK".equalsIgnoreCase(stockStatus)) {
                predicate = cb.and(predicate, cb.lessThanOrEqualTo(root.get("quantityInStock"), 0));
            } else if ("IN_STOCK".equalsIgnoreCase(stockStatus)) {
                predicate = cb.and(predicate, cb.greaterThan(root.get("quantityInStock"), root.get("lowStockThreshold")));
            }
            return predicate;
        };
        return repository.findAll(spec, query.toPageable(SORTS, "name"));
    }

    @Transactional(readOnly = true)
    public Product get(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND", "Product not found"));
    }

    @Transactional(readOnly = true)
    public List<Product> search(String q) {
        return repository.findAll((root, query, cb) -> {
            String pattern = "%" + q.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("sku")), pattern)
            );
        });
    }

    @Transactional
    public Product create(Product product, List<ProductImage> images) {
        ensureReferences(product);
        if (repository.existsBySku(product.getSku())) {
            throw new ApiException(HttpStatus.CONFLICT, "DUPLICATE_SKU", "SKU already exists", "sku");
        }
        Product saved = repository.save(product);
        saveImages(saved.getId(), images);
        return saved;
    }

    @Transactional
    public Product update(UUID id, Product payload, List<ProductImage> images) {
        Product existing = get(id);
        ensureReferences(payload);
        if (!existing.getSku().equals(payload.getSku()) && repository.existsBySku(payload.getSku())) {
            throw new ApiException(HttpStatus.CONFLICT, "DUPLICATE_SKU", "SKU already exists", "sku");
        }
        existing.setSku(payload.getSku());
        existing.setName(payload.getName());
        existing.setProductType(payload.getProductType());
        existing.setCategoryId(payload.getCategoryId());
        existing.setFabricType(payload.getFabricType());
        existing.setColor(payload.getColor());
        existing.setPattern(payload.getPattern());
        existing.setDesignCode(payload.getDesignCode());
        existing.setVendorId(payload.getVendorId());
        existing.setCostPrice(payload.getCostPrice());
        existing.setSellingPrice(payload.getSellingPrice());
        existing.setMrp(payload.getMrp());
        existing.setGstSlab(payload.getGstSlab());
        existing.setHsnCode(payload.getHsnCode());
        existing.setLowStockThreshold(payload.getLowStockThreshold());
        existing.setLength(payload.getLength());
        existing.setWidth(payload.getWidth());
        existing.setBlouseIncluded(payload.getBlouseIncluded());
        existing.setBlouseLength(payload.getBlouseLength());
        existing.setWeight(payload.getWeight());
        existing.setTags(payload.getTags());
        existing.setActive(payload.isActive());
        imageRepository.deleteByProductId(id);
        saveImages(id, images);
        return existing;
    }

    @Transactional
    public void delete(UUID id) {
        Product product = get(id);
        if (product.getQuantityInStock() > 0) {
            product.setActive(false);
            return;
        }
        repository.delete(product);
    }

    @Transactional
    public Product adjustStock(UUID id, int quantityDelta, String reason) {
        return stockLedgerService.adjust(id, quantityDelta, reason);
    }

    @Transactional(readOnly = true)
    public List<ProductImage> images(UUID productId) {
        return imageRepository.findByProductId(productId);
    }

    private void ensureReferences(Product product) {
        if (!categoryRepository.existsById(product.getCategoryId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "CATEGORY_NOT_FOUND", "Category not found", "categoryId");
        }
        if (!vendorRepository.existsById(product.getVendorId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VENDOR_NOT_FOUND", "Vendor not found", "vendorId");
        }
    }

    private void saveImages(UUID productId, List<ProductImage> images) {
        if (images == null) {
            return;
        }
        images.forEach(image -> image.setProductId(productId));
        imageRepository.saveAll(images);
    }
}
