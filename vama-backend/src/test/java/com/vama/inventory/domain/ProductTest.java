package com.vama.inventory.domain;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ProductTest {

    @Test
    void derivesStockStatusFromThreshold() {
        Product product = new Product();
        product.setLowStockThreshold(5);

        product.setQuantityInStock(0);
        assertThat(product.getStockStatus()).isEqualTo(StockStatus.OUT_OF_STOCK);

        product.setQuantityInStock(5);
        assertThat(product.getStockStatus()).isEqualTo(StockStatus.LOW_STOCK);

        product.setQuantityInStock(6);
        assertThat(product.getStockStatus()).isEqualTo(StockStatus.IN_STOCK);
    }
}
