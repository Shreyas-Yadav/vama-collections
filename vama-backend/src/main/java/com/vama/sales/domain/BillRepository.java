package com.vama.sales.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.UUID;

public interface BillRepository extends JpaRepository<Bill, UUID>, JpaSpecificationExecutor<Bill> {
    List<Bill> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);
}
