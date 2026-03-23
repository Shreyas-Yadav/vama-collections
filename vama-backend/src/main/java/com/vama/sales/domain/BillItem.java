package com.vama.sales.domain;

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
@Table(name = "bill_items")
public class BillItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bill_id", nullable = false)
    private Bill bill;

    @Column(nullable = false)
    private UUID productId;

    @Column(nullable = false)
    private String productName;

    @Column(nullable = false)
    private String sku;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private long unitPrice;

    @Column(nullable = false)
    private int discountPercent;

    @Column(nullable = false)
    private long discountAmount;

    @Column(nullable = false)
    private long taxableAmount;

    @Column(nullable = false)
    private long cgst;

    @Column(nullable = false)
    private long sgst;

    @Column(nullable = false)
    private long igst;

    @Column(nullable = false)
    private long lineTotal;

    @Column(nullable = false)
    private String hsnCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GstSlab gstSlab;
}
