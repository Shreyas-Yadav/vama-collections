package com.vama.reporting.api;

import com.vama.common.api.ApiResponse;
import com.vama.customer.domain.CustomerRepository;
import com.vama.inventory.domain.Product;
import com.vama.inventory.service.ProductService;
import com.vama.sales.domain.Bill;
import com.vama.sales.service.BillService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class ReportingController {

    private final BillService billService;
    private final ProductService productService;
    private final CustomerRepository customerRepository;

    public ReportingController(BillService billService, ProductService productService, CustomerRepository customerRepository) {
        this.billService = billService;
        this.productService = productService;
        this.customerRepository = customerRepository;
    }

    @GetMapping("/reports/gst")
    public ApiResponse<List<GstSummaryRow>> gst(@RequestParam(required = false) String from,
                                                @RequestParam(required = false) String to) {
        List<Bill> bills = billService.list(new com.vama.common.model.PageQuery(1, 1000, null, "createdAt", "desc"),
                        "PAID", parseDate(from), parseDate(to), null)
                .getContent();
        Map<String, GstSummaryRowAccumulator> grouped = new java.util.LinkedHashMap<>();
        for (Bill bill : bills) {
            for (var item : bill.getLineItems()) {
                grouped.computeIfAbsent(item.getHsnCode(), key -> new GstSummaryRowAccumulator())
                        .add(item.getTaxableAmount(), item.getCgst(), item.getSgst(), item.getIgst());
            }
        }
        List<GstSummaryRow> rows = grouped.entrySet().stream()
                .map(entry -> entry.getValue().toRow(entry.getKey()))
                .toList();
        return ApiResponse.success(rows);
    }

    @GetMapping("/reports/stock")
    public ApiResponse<StockSummary> stock() {
        List<Product> products = productService.list(new com.vama.common.model.PageQuery(1, 1000, null, "name", "asc"), null, null, null, null).getContent();
        long totalStockValue = products.stream().mapToLong(p -> p.getCostPrice() * p.getQuantityInStock()).sum();
        long lowStock = products.stream().filter(p -> p.getQuantityInStock() > 0 && p.getQuantityInStock() <= p.getLowStockThreshold()).count();
        long outOfStock = products.stream().filter(p -> p.getQuantityInStock() <= 0).count();
        return ApiResponse.success(new StockSummary(totalStockValue, lowStock, outOfStock));
    }

    @GetMapping("/customers/{id}/bills")
    public ApiResponse<List<BillResponseLite>> customerBills(@PathVariable UUID id) {
        if (!customerRepository.existsById(id)) {
            throw new com.vama.common.exception.ApiException(HttpStatus.NOT_FOUND, "CUSTOMER_NOT_FOUND", "Customer not found");
        }
        return ApiResponse.success(billService.listByCustomer(id).stream().map(BillResponseLite::from).toList());
    }

    private OffsetDateTime parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        if (value.length() == 10) {
            return java.time.LocalDate.parse(value).atStartOfDay().atOffset(java.time.ZoneOffset.UTC);
        }
        return OffsetDateTime.parse(value);
    }
}

record GstSummaryRow(String hsnCode, long taxable, long cgst, long sgst, long igst, long total) {
}

final class GstSummaryRowAccumulator {
    private long taxable;
    private long cgst;
    private long sgst;
    private long igst;

    void add(long taxable, long cgst, long sgst, long igst) {
        this.taxable += taxable;
        this.cgst += cgst;
        this.sgst += sgst;
        this.igst += igst;
    }

    GstSummaryRow toRow(String hsnCode) {
        return new GstSummaryRow(hsnCode, taxable, cgst, sgst, igst, cgst + sgst + igst);
    }
}

record StockSummary(long totalStockValue, long lowStockItems, long outOfStockItems) {
}

record BillResponseLite(String id, String billNumber, String customerName, String status, long grandTotal, String createdAt, int itemCount) {
    static BillResponseLite from(Bill bill) {
        return new BillResponseLite(bill.getId().toString(), bill.getBillNumber(), bill.getCustomerName(),
                bill.getStatus().name(), bill.getGrandTotal(), bill.getCreatedAt().toString(), bill.getLineItems().size());
    }
}
