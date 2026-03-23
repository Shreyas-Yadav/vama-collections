package com.vama.customer.api;

import com.vama.common.api.ApiResponse;
import com.vama.common.api.PaginatedResponse;
import com.vama.common.model.PageQuery;
import com.vama.common.service.PageResponseFactory;
import com.vama.customer.domain.Customer;
import com.vama.customer.service.CustomerService;
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
@RequestMapping("/api/v1/customers")
public class CustomerController {

    private final CustomerService service;
    private final PageResponseFactory pageResponseFactory;

    public CustomerController(CustomerService service, PageResponseFactory pageResponseFactory) {
        this.service = service;
        this.pageResponseFactory = pageResponseFactory;
    }

    @GetMapping
    public PaginatedResponse<CustomerResponse> list(@RequestParam(defaultValue = "1") int page,
                                                    @RequestParam(defaultValue = "20") int pageSize,
                                                    @RequestParam(required = false) String search,
                                                    @RequestParam(required = false) String sortBy,
                                                    @RequestParam(required = false) String sortDir) {
        return pageResponseFactory.create(service.list(new PageQuery(page, pageSize, search, sortBy == null ? "name" : sortBy, sortDir)), CustomerResponse::from);
    }

    @GetMapping("/search")
    public ApiResponse<List<CustomerResponse>> search(@RequestParam("q") String query) {
        return ApiResponse.success(service.search(query).stream().map(CustomerResponse::from).toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<CustomerResponse> get(@PathVariable UUID id) {
        return ApiResponse.success(CustomerResponse.from(service.get(id)));
    }

    @PostMapping
    public ApiResponse<CustomerResponse> create(@Valid @RequestBody CustomerRequest request) {
        return ApiResponse.success(CustomerResponse.from(service.create(request.toEntity())));
    }

    @PatchMapping("/{id}")
    public ApiResponse<CustomerResponse> update(@PathVariable UUID id, @Valid @RequestBody CustomerRequest request) {
        return ApiResponse.success(CustomerResponse.from(service.update(id, request.toEntity())));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}

record CustomerRequest(
        @NotBlank String name,
        @NotBlank String phone,
        String alternatePhone,
        String email,
        String addressLine1,
        String city,
        String state,
        String pincode,
        String gstin,
        String notes
) {
    Customer toEntity() {
        Customer customer = new Customer();
        customer.setName(name);
        customer.setPhone(phone);
        customer.setAlternatePhone(alternatePhone);
        customer.setEmail(email);
        customer.setAddressLine1(addressLine1);
        customer.setCity(city);
        customer.setState(state);
        customer.setPincode(pincode);
        customer.setGstin(gstin);
        customer.setNotes(notes);
        return customer;
    }
}

record CustomerResponse(
        String id, String name, String phone, String alternatePhone, String email, String addressLine1, String city, String state, String pincode,
        String gstin, long totalPurchaseValue, int totalOrders, String lastPurchaseDate, int loyaltyPoints, String notes, String createdAt, String updatedAt
) {
    static CustomerResponse from(Customer customer) {
        return new CustomerResponse(customer.getId().toString(), customer.getName(), customer.getPhone(), customer.getAlternatePhone(),
                customer.getEmail(), customer.getAddressLine1(), customer.getCity(), customer.getState(), customer.getPincode(),
                customer.getGstin(), customer.getTotalPurchaseValue(), customer.getTotalOrders(),
                customer.getLastPurchaseDate() != null ? customer.getLastPurchaseDate().toString() : null,
                customer.getLoyaltyPoints(), customer.getNotes(), customer.getCreatedAt().toString(), customer.getUpdatedAt().toString());
    }
}
