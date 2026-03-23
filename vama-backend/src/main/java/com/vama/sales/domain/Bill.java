package com.vama.sales.domain;

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

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "bills")
public class Bill extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String billNumber;

    private UUID customerId;
    @Column(nullable = false)
    private String customerName;
    private String customerPhone;
    private String customerGstin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillStatus status;

    @Column(nullable = false)
    private boolean isInterState;

    @Column(nullable = false)
    private boolean isGstEnabled;

    @Column(nullable = false)
    private long subtotal;

    @Column(nullable = false)
    private long totalDiscount;

    @Column(nullable = false)
    private long totalCgst;

    @Column(nullable = false)
    private long totalSgst;

    @Column(nullable = false)
    private long totalIgst;

    @Column(nullable = false)
    private long totalGst;

    @Column(nullable = false)
    private long roundOff;

    @Column(nullable = false)
    private long grandTotal;

    @Column(nullable = false)
    private long amountPaid;

    @Column(nullable = false)
    private long balanceDue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    private String paymentDetails;
    private String notes;

    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<BillItem> lineItems = new ArrayList<>();
}
