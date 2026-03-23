package com.vama.settings.service;

import com.vama.settings.domain.StoreSettings;
import com.vama.settings.domain.StoreSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StoreSettingsService {

    private final StoreSettingsRepository repository;

    public StoreSettingsService(StoreSettingsRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public StoreSettings getSettings() {
        return repository.findAll().stream().findFirst().orElseGet(this::defaultSettings);
    }

    @Transactional
    public StoreSettings save(StoreSettings input) {
        StoreSettings existing = repository.findAll().stream().findFirst().orElse(new StoreSettings());
        existing.setStoreName(input.getStoreName());
        existing.setOwnerName(input.getOwnerName());
        existing.setPhone(input.getPhone());
        existing.setEmail(input.getEmail());
        existing.setAddressLine1(input.getAddressLine1());
        existing.setCity(input.getCity());
        existing.setState(input.getState());
        existing.setPincode(input.getPincode());
        existing.setGstin(input.getGstin());
        existing.setBankName(input.getBankName());
        existing.setAccountNumber(input.getAccountNumber());
        existing.setIfscCode(input.getIfscCode());
        existing.setUpiId(input.getUpiId());
        return repository.save(existing);
    }

    private StoreSettings defaultSettings() {
        StoreSettings settings = new StoreSettings();
        settings.setStoreName("Vama Saree Centre");
        settings.setState("Maharashtra");
        return settings;
    }
}
