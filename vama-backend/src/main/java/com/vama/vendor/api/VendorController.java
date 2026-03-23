package com.vama.vendor.api;

import com.vama.common.api.ApiResponse;
import com.vama.common.api.PaginatedResponse;
import com.vama.common.model.PageQuery;
import com.vama.common.service.PageResponseFactory;
import com.vama.vendor.domain.Vendor;
import com.vama.vendor.domain.VendorType;
import com.vama.vendor.service.VendorService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/vendors")
public class VendorController {

    private final VendorService service;
    private final PageResponseFactory pageResponseFactory;

    public VendorController(VendorService service, PageResponseFactory pageResponseFactory) {
        this.service = service;
        this.pageResponseFactory = pageResponseFactory;
    }

    @GetMapping
    public PaginatedResponse<VendorResponse> list(@RequestParam(defaultValue = "1") int page,
                                                  @RequestParam(defaultValue = "20") int pageSize,
                                                  @RequestParam(required = false) String search,
                                                  @RequestParam(required = false) String sortBy,
                                                  @RequestParam(required = false) String sortDir) {
        return pageResponseFactory.create(service.list(new PageQuery(page, pageSize, search, sortBy == null ? "name" : sortBy, sortDir)), VendorResponse::from);
    }

    @GetMapping("/all")
    public ApiResponse<List<VendorResponse>> all() {
        return ApiResponse.success(service.all().stream().map(VendorResponse::from).toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<VendorResponse> get(@PathVariable UUID id) {
        return ApiResponse.success(VendorResponse.from(service.get(id)));
    }

    @PostMapping
    public ApiResponse<VendorResponse> create(@Valid @RequestBody VendorRequest request) {
        return ApiResponse.success(VendorResponse.from(service.create(request.toEntity())));
    }

    @PatchMapping("/{id}")
    public ApiResponse<VendorResponse> update(@PathVariable UUID id, @Valid @RequestBody VendorRequest request) {
        return ApiResponse.success(VendorResponse.from(service.update(id, request.toEntity())));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}

record VendorRequest(
        @NotBlank String name,
        @NotBlank String contactPerson,
        @NotBlank String phone,
        String alternatePhone,
        String email,
        @NotBlank String addressLine1,
        String addressLine2,
        @NotBlank String city,
        @NotBlank String state,
        @NotBlank String pincode,
        String gstin,
        String panNumber,
        @NotBlank String vendorType,
        int creditPeriodDays,
        String notes,
        boolean isActive
) {
    Vendor toEntity() {
        Vendor vendor = new Vendor();
        vendor.setName(name);
        vendor.setContactPerson(contactPerson);
        vendor.setPhone(phone);
        vendor.setAlternatePhone(alternatePhone);
        vendor.setEmail(email);
        vendor.setAddressLine1(addressLine1);
        vendor.setAddressLine2(addressLine2);
        vendor.setCity(city);
        vendor.setState(state);
        vendor.setPincode(pincode);
        vendor.setGstin(gstin);
        vendor.setPanNumber(panNumber);
        vendor.setVendorType(VendorType.valueOf(vendorType));
        vendor.setCreditPeriodDays(creditPeriodDays);
        vendor.setNotes(notes);
        vendor.setActive(isActive);
        return vendor;
    }
}

record VendorResponse(
        String id, String name, String contactPerson, String phone, String alternatePhone, String email,
        String addressLine1, String addressLine2, String city, String state, String pincode, String gstin,
        String panNumber, String vendorType, int creditPeriodDays, String notes, boolean isActive, long totalPurchaseValue,
        String createdAt, String updatedAt
) {
    static VendorResponse from(Vendor vendor) {
        return new VendorResponse(vendor.getId().toString(), vendor.getName(), vendor.getContactPerson(), vendor.getPhone(),
                vendor.getAlternatePhone(), vendor.getEmail(), vendor.getAddressLine1(), vendor.getAddressLine2(),
                vendor.getCity(), vendor.getState(), vendor.getPincode(), vendor.getGstin(), vendor.getPanNumber(),
                vendor.getVendorType().name(), vendor.getCreditPeriodDays(), vendor.getNotes(), vendor.isActive(),
                vendor.getTotalPurchaseValue(), vendor.getCreatedAt().toString(), vendor.getUpdatedAt().toString());
    }
}
