package com.vama.inventory.domain;

import com.vama.common.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "product_images")
public class ProductImage extends BaseEntity {

    @Column(nullable = false)
    private UUID productId;

    @Column(nullable = false)
    private String url;

    @Column(nullable = false)
    private boolean isPrimary;
}
