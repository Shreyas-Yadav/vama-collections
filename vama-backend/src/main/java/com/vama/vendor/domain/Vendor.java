package com.vama.vendor.domain;

import com.vama.common.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "vendors")
public class Vendor extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String contactPerson;

    @Column(nullable = false)
    private String phone;

    private String alternatePhone;
    private String email;

    @Column(nullable = false)
    private String addressLine1;

    private String addressLine2;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String pincode;

    private String gstin;
    private String panNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VendorType vendorType;

    @Column(nullable = false)
    private int creditPeriodDays;

    private String notes;

    @Column(nullable = false)
    private boolean isActive;

    @Column(nullable = false)
    private long totalPurchaseValue;
}
