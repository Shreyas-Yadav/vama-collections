package com.vama.vendor.service;

import com.vama.common.exception.ApiException;
import com.vama.common.model.PageQuery;
import com.vama.inventory.domain.ProductRepository;
import com.vama.purchase.domain.PurchaseOrderRepository;
import com.vama.vendor.domain.Vendor;
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
public class VendorService {

    private static final Set<String> SORTS = Set.of("name", "createdAt", "updatedAt", "city", "vendorType", "creditPeriodDays", "totalPurchaseValue", "isActive");

    private final VendorRepository repository;
    private final ProductRepository productRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public VendorService(VendorRepository repository, ProductRepository productRepository, PurchaseOrderRepository purchaseOrderRepository) {
        this.repository = repository;
        this.productRepository = productRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    @Transactional(readOnly = true)
    public Page<Vendor> list(PageQuery query) {
        Specification<Vendor> spec = (root, q, cb) -> {
            if (query.search() == null || query.search().isBlank()) {
                return cb.conjunction();
            }
            String pattern = "%" + query.search().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("phone")), pattern),
                    cb.like(cb.lower(root.get("city")), pattern)
            );
        };
        return repository.findAll(spec, query.toPageable(SORTS, "name"));
    }

    @Transactional(readOnly = true)
    public List<Vendor> all() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Vendor get(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "VENDOR_NOT_FOUND", "Vendor not found"));
    }

    @Transactional
    public Vendor create(Vendor vendor) {
        return repository.save(vendor);
    }

    @Transactional
    public Vendor update(UUID id, Vendor payload) {
        Vendor existing = get(id);
        existing.setName(payload.getName());
        existing.setContactPerson(payload.getContactPerson());
        existing.setPhone(payload.getPhone());
        existing.setAlternatePhone(payload.getAlternatePhone());
        existing.setEmail(payload.getEmail());
        existing.setAddressLine1(payload.getAddressLine1());
        existing.setAddressLine2(payload.getAddressLine2());
        existing.setCity(payload.getCity());
        existing.setState(payload.getState());
        existing.setPincode(payload.getPincode());
        existing.setGstin(payload.getGstin());
        existing.setPanNumber(payload.getPanNumber());
        existing.setVendorType(payload.getVendorType());
        existing.setCreditPeriodDays(payload.getCreditPeriodDays());
        existing.setNotes(payload.getNotes());
        existing.setActive(payload.isActive());
        return existing;
    }

    @Transactional
    public void delete(UUID id) {
        Vendor vendor = get(id);
        if (productRepository.countByVendorId(id) > 0 || purchaseOrderRepository.count((root, q, cb) -> cb.equal(root.get("vendorId"), id)) > 0) {
            vendor.setActive(false);
            return;
        }
        repository.delete(vendor);
    }
}
