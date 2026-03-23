package com.vama.settings.api;

import com.vama.common.api.ApiResponse;
import com.vama.settings.domain.StoreSettings;
import com.vama.settings.service.StoreSettingsService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/settings/store")
public class StoreSettingsController {

    private final StoreSettingsService service;

    public StoreSettingsController(StoreSettingsService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<StoreSettingsResponse> get() {
        return ApiResponse.success(StoreSettingsResponse.from(service.getSettings()));
    }

    @PutMapping
    public ApiResponse<StoreSettingsResponse> save(@Valid @RequestBody StoreSettingsRequest request) {
        StoreSettings settings = new StoreSettings();
        settings.setStoreName(request.storeName());
        settings.setOwnerName(request.ownerName());
        settings.setPhone(request.phone());
        settings.setEmail(request.email());
        settings.setAddressLine1(request.addressLine1());
        settings.setCity(request.city());
        settings.setState(request.state());
        settings.setPincode(request.pincode());
        settings.setGstin(request.gstin());
        settings.setBankName(request.bankName());
        settings.setAccountNumber(request.accountNumber());
        settings.setIfscCode(request.ifscCode());
        settings.setUpiId(request.upiId());
        return ApiResponse.success(StoreSettingsResponse.from(service.save(settings)));
    }
}

record StoreSettingsRequest(
        @NotBlank String storeName,
        String ownerName,
        String phone,
        String email,
        String addressLine1,
        String city,
        String state,
        String pincode,
        String gstin,
        String bankName,
        String accountNumber,
        String ifscCode,
        String upiId
) {
}

record StoreSettingsResponse(
        String id,
        String storeName,
        String ownerName,
        String phone,
        String email,
        String addressLine1,
        String city,
        String state,
        String pincode,
        String gstin,
        String bankName,
        String accountNumber,
        String ifscCode,
        String upiId,
        String createdAt,
        String updatedAt
) {
    static StoreSettingsResponse from(StoreSettings settings) {
        return new StoreSettingsResponse(
                settings.getId() != null ? settings.getId().toString() : null,
                settings.getStoreName(),
                settings.getOwnerName(),
                settings.getPhone(),
                settings.getEmail(),
                settings.getAddressLine1(),
                settings.getCity(),
                settings.getState(),
                settings.getPincode(),
                settings.getGstin(),
                settings.getBankName(),
                settings.getAccountNumber(),
                settings.getIfscCode(),
                settings.getUpiId(),
                settings.getCreatedAt() != null ? settings.getCreatedAt().toString() : null,
                settings.getUpdatedAt() != null ? settings.getUpdatedAt().toString() : null
        );
    }
}
