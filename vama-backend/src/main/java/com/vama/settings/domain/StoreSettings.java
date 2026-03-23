package com.vama.settings.domain;

import com.vama.common.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "store_settings")
public class StoreSettings extends BaseEntity {

    @Column(nullable = false)
    private String storeName;

    private String ownerName;
    private String phone;
    private String email;
    private String addressLine1;
    private String city;
    private String state;
    private String pincode;
    private String gstin;
    private String bankName;
    private String accountNumber;
    private String ifscCode;
    private String upiId;
}
