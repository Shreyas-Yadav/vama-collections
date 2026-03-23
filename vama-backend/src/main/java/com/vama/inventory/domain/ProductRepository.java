package com.vama.inventory.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {
    boolean existsBySku(String sku);
    Optional<Product> findBySku(String sku);
    long countByCategoryId(UUID categoryId);
    long countByVendorId(UUID vendorId);
}
