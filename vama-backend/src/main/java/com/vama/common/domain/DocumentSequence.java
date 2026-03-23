package com.vama.common.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "document_sequences")
public class DocumentSequence {

    @Id
    @Column(name = "sequence_key")
    private String key;

    @Column(name = "current_value", nullable = false)
    private long currentValue;
}
