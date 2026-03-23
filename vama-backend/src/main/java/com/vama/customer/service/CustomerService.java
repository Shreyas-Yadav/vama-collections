package com.vama.customer.service;

import com.vama.common.exception.ApiException;
import com.vama.common.model.PageQuery;
import com.vama.customer.domain.Customer;
import com.vama.customer.domain.CustomerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class CustomerService {

    private static final Set<String> SORTS = Set.of("name", "createdAt", "updatedAt", "lastPurchaseDate", "totalOrders", "totalPurchaseValue", "loyaltyPoints");

    private final CustomerRepository repository;

    public CustomerService(CustomerRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public Page<Customer> list(PageQuery query) {
        Specification<Customer> spec = bySearch(query.search());
        return repository.findAll(spec, query.toPageable(SORTS, "name"));
    }

    @Transactional(readOnly = true)
    public List<Customer> search(String search) {
        return repository.findAll(bySearch(search));
    }

    @Transactional(readOnly = true)
    public Customer get(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CUSTOMER_NOT_FOUND", "Customer not found"));
    }

    @Transactional
    public Customer create(Customer customer) {
        customer.setTotalOrders(0);
        customer.setTotalPurchaseValue(0);
        customer.setLoyaltyPoints(0);
        return repository.save(customer);
    }

    @Transactional
    public Customer update(UUID id, Customer payload) {
        Customer existing = get(id);
        existing.setName(payload.getName());
        existing.setPhone(payload.getPhone());
        existing.setAlternatePhone(payload.getAlternatePhone());
        existing.setEmail(payload.getEmail());
        existing.setAddressLine1(payload.getAddressLine1());
        existing.setCity(payload.getCity());
        existing.setState(payload.getState());
        existing.setPincode(payload.getPincode());
        existing.setGstin(payload.getGstin());
        existing.setNotes(payload.getNotes());
        return existing;
    }

    @Transactional
    public void delete(UUID id) {
        repository.delete(get(id));
    }

    @Transactional
    public void applyPurchase(UUID customerId, long grandTotal) {
        if (customerId == null) {
            return;
        }
        Customer customer = get(customerId);
        customer.setTotalOrders(customer.getTotalOrders() + 1);
        customer.setTotalPurchaseValue(customer.getTotalPurchaseValue() + grandTotal);
        customer.setLastPurchaseDate(OffsetDateTime.now());
    }

    private Specification<Customer> bySearch(String search) {
        return (root, q, cb) -> {
            if (search == null || search.isBlank()) {
                return cb.conjunction();
            }
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("phone")), pattern),
                    cb.like(cb.lower(root.get("email")), pattern),
                    cb.like(cb.lower(root.get("gstin")), pattern)
            );
        };
    }
}
