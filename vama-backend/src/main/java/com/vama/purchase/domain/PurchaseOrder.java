package com.vama.purchase.domain;

import com.vama.common.model.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String poNumber;

    @Column(nullable = false)
    private UUID vendorId;

    @Column(nullable = false)
    private String vendorName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PoStatus status;

    @Column(nullable = false)
    private LocalDate orderDate;

    private LocalDate expectedDeliveryDate;
    private LocalDate receivedDate;

    @Column(nullable = false)
    private long subtotal;

    @Column(nullable = false)
    private long totalGst;

    @Column(nullable = false)
    private long totalAmount;

    @Column(nullable = false)
    private long discountAmount;

    private String notes;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<PurchaseOrderItem> lineItems = new ArrayList<>();
}
