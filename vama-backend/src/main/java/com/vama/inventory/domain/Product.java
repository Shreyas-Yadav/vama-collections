package com.vama.inventory.domain;

import com.vama.common.model.BaseEntity;
import com.vama.common.model.GstSlab;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "products")
public class Product extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String sku;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductType productType;

    @Column(nullable = false)
    private UUID categoryId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FabricType fabricType;

    @Column(nullable = false)
    private String color;

    @Column(nullable = false)
    private String pattern;

    private String designCode;

    @Column(nullable = false)
    private UUID vendorId;

    @Column(nullable = false)
    private long costPrice;

    @Column(nullable = false)
    private long sellingPrice;

    private Long mrp;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GstSlab gstSlab;

    @Column(nullable = false)
    private String hsnCode;

    @Column(nullable = false)
    private int quantityInStock;

    @Column(nullable = false)
    private int lowStockThreshold;

    private BigDecimal length;
    private BigDecimal width;
    private Boolean blouseIncluded;
    private BigDecimal blouseLength;
    private BigDecimal weight;

    @Column(columnDefinition = "TEXT")
    private String tags;

    @Column(nullable = false)
    private boolean isActive;

    @Version
    private long version;

    public StockStatus getStockStatus() {
        if (quantityInStock <= 0) {
            return StockStatus.OUT_OF_STOCK;
        }
        if (quantityInStock <= lowStockThreshold) {
            return StockStatus.LOW_STOCK;
        }
        return StockStatus.IN_STOCK;
    }
}
