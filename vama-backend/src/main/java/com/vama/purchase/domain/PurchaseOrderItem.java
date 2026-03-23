package com.vama.purchase.domain;

import com.vama.common.model.BaseEntity;
import com.vama.common.model.GstSlab;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "purchase_order_items")
public class PurchaseOrderItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @Column(nullable = false)
    private UUID productId;

    @Column(nullable = false)
    private String productName;

    @Column(nullable = false)
    private String sku;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private int receivedQuantity;

    @Column(nullable = false)
    private long unitCost;

    @Column(nullable = false)
    private long totalCost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GstSlab gstSlab;

    @Column(nullable = false)
    private String hsnCode;
}
