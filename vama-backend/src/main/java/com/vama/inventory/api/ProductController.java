package com.vama.inventory.api;

import com.vama.common.api.ApiResponse;
import com.vama.common.api.PaginatedResponse;
import com.vama.common.model.GstSlab;
import com.vama.common.model.PageQuery;
import com.vama.common.service.EnumMapper;
import com.vama.common.service.PageResponseFactory;
import com.vama.inventory.domain.FabricType;
import com.vama.inventory.domain.Product;
import com.vama.inventory.domain.ProductImage;
import com.vama.inventory.domain.ProductType;
import com.vama.inventory.service.ProductService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService service;
    private final PageResponseFactory pageResponseFactory;

    public ProductController(ProductService service, PageResponseFactory pageResponseFactory) {
        this.service = service;
        this.pageResponseFactory = pageResponseFactory;
    }

    @GetMapping
    public PaginatedResponse<ProductResponse> list(@RequestParam(defaultValue = "1") int page,
                                                   @RequestParam(defaultValue = "20") int pageSize,
                                                   @RequestParam(required = false) String search,
                                                   @RequestParam(required = false) String categoryId,
                                                   @RequestParam(required = false) String stockStatus,
                                                   @RequestParam(required = false) String productType,
                                                   @RequestParam(required = false) String vendorId,
                                                   @RequestParam(required = false) String sortBy,
                                                   @RequestParam(required = false) String sortDir) {
        return pageResponseFactory.create(
                service.list(new PageQuery(page, pageSize, search, sortBy == null ? "name" : sortBy, sortDir),
                        uuid(categoryId), stockStatus, productType, uuid(vendorId)),
                product -> ProductResponse.from(product, service.images(product.getId()))
        );
    }

    @GetMapping("/search")
    public ApiResponse<List<ProductResponse>> search(@RequestParam("q") String query) {
        return ApiResponse.success(service.search(query).stream()
                .map(product -> ProductResponse.from(product, service.images(product.getId())))
                .toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> get(@PathVariable UUID id) {
        Product product = service.get(id);
        return ApiResponse.success(ProductResponse.from(product, service.images(id)));
    }

    @PostMapping
    public ApiResponse<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        Product product = service.create(request.toEntity(), request.toImages());
        return ApiResponse.success(ProductResponse.from(product, service.images(product.getId())));
    }

    @PatchMapping("/{id}")
    public ApiResponse<ProductResponse> update(@PathVariable UUID id, @Valid @RequestBody ProductRequest request) {
        Product product = service.update(id, request.toEntity(), request.toImages());
        return ApiResponse.success(ProductResponse.from(product, service.images(product.getId())));
    }

    @PostMapping("/{id}/adjust-stock")
    public ApiResponse<ProductResponse> adjustStock(@PathVariable UUID id, @Valid @RequestBody StockAdjustmentRequest request) {
        Product product = service.adjustStock(id, request.quantityDelta(), request.reason());
        return ApiResponse.success(ProductResponse.from(product, service.images(product.getId())));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    private UUID uuid(String value) {
        return value == null || value.isBlank() ? null : UUID.fromString(value);
    }
}

record ProductRequest(
        @NotBlank String sku,
        @NotBlank String name,
        @NotBlank String productType,
        @NotBlank String categoryId,
        @NotBlank String fabricType,
        @NotBlank String color,
        @NotBlank String pattern,
        String designCode,
        @NotBlank String vendorId,
        @Positive long costPrice,
        @Positive long sellingPrice,
        Long mrp,
        int gstSlab,
        @NotBlank String hsnCode,
        int quantityInStock,
        int lowStockThreshold,
        BigDecimal length,
        BigDecimal width,
        Boolean blouseIncluded,
        BigDecimal blouseLength,
        BigDecimal weight,
        List<ImageRequest> images,
        List<String> tags,
        boolean isActive
) {
    Product toEntity() {
        Product product = new Product();
        product.setSku(sku);
        product.setName(name);
        product.setProductType(EnumMapper.fromFrontend(ProductType.class, productType));
        product.setCategoryId(UUID.fromString(categoryId));
        product.setFabricType(EnumMapper.fromFrontend(FabricType.class, fabricType));
        product.setColor(color);
        product.setPattern(pattern);
        product.setDesignCode(designCode);
        product.setVendorId(UUID.fromString(vendorId));
        product.setCostPrice(costPrice);
        product.setSellingPrice(sellingPrice);
        product.setMrp(mrp);
        product.setGstSlab(GstSlab.fromRate(gstSlab));
        product.setHsnCode(hsnCode);
        product.setQuantityInStock(quantityInStock);
        product.setLowStockThreshold(lowStockThreshold);
        product.setLength(length);
        product.setWidth(width);
        product.setBlouseIncluded(blouseIncluded);
        product.setBlouseLength(blouseLength);
        product.setWeight(weight);
        product.setTags(tags == null ? null : String.join(",", tags));
        product.setActive(isActive);
        return product;
    }

    List<ProductImage> toImages() {
        if (images == null) {
            return List.of();
        }
        return images.stream().map(image -> {
            ProductImage entity = new ProductImage();
            entity.setUrl(image.url());
            entity.setPrimary(image.isPrimary());
            return entity;
        }).toList();
    }
}

record ImageRequest(String url, boolean isPrimary) {
}

record StockAdjustmentRequest(int quantityDelta, @NotBlank String reason) {
}

record ProductResponse(
        String id, String sku, String name, String productType, String categoryId, String fabricType, String color, String pattern,
        String designCode, String vendorId, long costPrice, long sellingPrice, Long mrp, int gstSlab, String hsnCode,
        int quantityInStock, int lowStockThreshold, String stockStatus, BigDecimal length, BigDecimal width, Boolean blouseIncluded,
        BigDecimal blouseLength, BigDecimal weight, List<ProductImageResponse> images, List<String> tags, boolean isActive, String createdAt, String updatedAt
) {
    static ProductResponse from(Product product, List<ProductImage> images) {
        return new ProductResponse(
                product.getId().toString(), product.getSku(), product.getName(), EnumMapper.toFrontend(product.getProductType()),
                product.getCategoryId().toString(), EnumMapper.toFrontend(product.getFabricType()), product.getColor(), product.getPattern(),
                product.getDesignCode(), product.getVendorId().toString(), product.getCostPrice(), product.getSellingPrice(), product.getMrp(),
                product.getGstSlab().getRate(), product.getHsnCode(), product.getQuantityInStock(), product.getLowStockThreshold(),
                product.getStockStatus().name(), product.getLength(), product.getWidth(), product.getBlouseIncluded(),
                product.getBlouseLength(), product.getWeight(),
                images.stream().map(image -> new ProductImageResponse(image.getId().toString(), image.getUrl(), image.isPrimary())).toList(),
                product.getTags() == null || product.getTags().isBlank() ? List.of() : List.of(product.getTags().split(",")),
                product.isActive(), product.getCreatedAt().toString(), product.getUpdatedAt().toString()
        );
    }
}

record ProductImageResponse(String id, String url, boolean isPrimary) {
}
