package com.vama.inventory.service;

import com.vama.common.exception.ApiException;
import com.vama.inventory.domain.Product;
import com.vama.inventory.domain.ProductRepository;
import com.vama.inventory.domain.StockMovement;
import com.vama.inventory.domain.StockMovementRepository;
import com.vama.inventory.domain.StockMovementType;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
public class StockLedgerService {

    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;

    public StockLedgerService(ProductRepository productRepository, StockMovementRepository stockMovementRepository) {
        this.productRepository = productRepository;
        this.stockMovementRepository = stockMovementRepository;
    }

    @Transactional
    public void issue(UUID productId, int quantity, UUID sourceId, String sourceType, String reason) {
        apply(productId, -quantity, sourceId, sourceType, reason, StockMovementType.SALE_ISSUE, null);
    }

    @Transactional
    public void receive(UUID productId, int quantity, long unitCost, UUID sourceId, String sourceType, String reason) {
        apply(productId, quantity, sourceId, sourceType, reason, StockMovementType.PURCHASE_RECEIPT, unitCost);
    }

    @Transactional
    public void reverseSale(UUID productId, int quantity, UUID sourceId, String sourceType, String reason) {
        apply(productId, quantity, sourceId, sourceType, reason, StockMovementType.SALE_CANCEL_REVERSAL, null);
    }

    @Transactional
    public Product adjust(UUID productId, int delta, String reason) {
        StockMovementType type = delta >= 0 ? StockMovementType.MANUAL_ADJUSTMENT_IN : StockMovementType.MANUAL_ADJUSTMENT_OUT;
        return apply(productId, delta, null, "PRODUCT", reason, type, null);
    }

    private Product apply(UUID productId, int delta, UUID sourceId, String sourceType, String reason, StockMovementType type, Long unitCost) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND", "Product not found"));
        int nextStock = product.getQuantityInStock() + delta;
        if (nextStock < 0) {
            throw new ApiException(HttpStatus.CONFLICT, "INSUFFICIENT_STOCK", "Insufficient stock", "quantity");
        }
        product.setQuantityInStock(nextStock);
        StockMovement movement = new StockMovement();
        movement.setProductId(productId);
        movement.setMovementType(type);
        movement.setSourceType(sourceType);
        movement.setSourceId(sourceId);
        movement.setQuantityDelta(delta);
        movement.setUnitCost(unitCost);
        movement.setReason(reason);
        movement.setOccurredAt(OffsetDateTime.now(ZoneOffset.UTC));
        stockMovementRepository.save(movement);
        return product;
    }
}
