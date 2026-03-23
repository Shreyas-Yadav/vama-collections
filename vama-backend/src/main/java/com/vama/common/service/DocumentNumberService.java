package com.vama.common.service;

import com.vama.common.domain.DocumentSequence;
import com.vama.common.domain.DocumentSequenceRepository;
import com.vama.common.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;

@Service
public class DocumentNumberService {

    private final DocumentSequenceRepository repository;

    public DocumentNumberService(DocumentSequenceRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public String nextPoNumber() {
        long value = next("PO");
        return "PO-" + Year.now().getValue() + "-" + String.format("%04d", value);
    }

    @Transactional
    public String nextBillNumber() {
        long value = next("BILL");
        return "VAMA-" + Year.now().getValue() + "-" + String.format("%05d", value);
    }

    private long next(String key) {
        DocumentSequence sequence = repository.findByKey(key)
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "SEQUENCE_NOT_FOUND", "Sequence not initialized"));
        sequence.setCurrentValue(sequence.getCurrentValue() + 1);
        return sequence.getCurrentValue();
    }
}
