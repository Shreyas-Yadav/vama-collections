package com.vama.customer.domain;

import com.vama.common.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "customers")
public class Customer extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    private String alternatePhone;
    private String email;
    private String addressLine1;
    private String city;
    private String state;
    private String pincode;
    private String gstin;

    @Column(nullable = false)
    private long totalPurchaseValue;

    @Column(nullable = false)
    private int totalOrders;

    private OffsetDateTime lastPurchaseDate;

    @Column(nullable = false)
    private int loyaltyPoints;

    private String notes;
}
