package com.vama.inventory.domain;

import com.vama.common.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "stock_movements")
public class StockMovement extends BaseEntity {

    @Column(nullable = false)
    private UUID productId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StockMovementType movementType;

    @Column(nullable = false)
    private String sourceType;

    private UUID sourceId;
    private Long unitCost;

    @Column(nullable = false)
    private int quantityDelta;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private OffsetDateTime occurredAt;
}
