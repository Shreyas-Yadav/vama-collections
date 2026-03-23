package com.vama.sales.api;

import com.vama.common.api.ApiResponse;
import com.vama.common.api.PaginatedResponse;
import com.vama.common.model.GstSlab;
import com.vama.common.model.PageQuery;
import com.vama.common.service.PageResponseFactory;
import com.vama.sales.domain.Bill;
import com.vama.sales.domain.BillItem;
import com.vama.sales.domain.BillStatus;
import com.vama.sales.domain.PaymentMethod;
import com.vama.sales.service.BillService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bills")
public class BillController {

    private final BillService service;
    private final PageResponseFactory pageResponseFactory;

    public BillController(BillService service, PageResponseFactory pageResponseFactory) {
        this.service = service;
        this.pageResponseFactory = pageResponseFactory;
    }

    @GetMapping
    public PaginatedResponse<BillResponse> list(@RequestParam(defaultValue = "1") int page,
                                                @RequestParam(defaultValue = "20") int pageSize,
                                                @RequestParam(required = false) String search,
                                                @RequestParam(required = false) String status,
                                                @RequestParam(required = false) String from,
                                                @RequestParam(required = false) String to,
                                                @RequestParam(required = false) String customerId,
                                                @RequestParam(required = false) String sortBy,
                                                @RequestParam(required = false) String sortDir) {
        return pageResponseFactory.create(service.list(new PageQuery(page, pageSize, search, sortBy == null ? "createdAt" : sortBy, sortDir),
                status, parseDate(from), parseDate(to), uuid(customerId)), BillResponse::from);
    }

    @GetMapping("/{id}")
    public ApiResponse<BillResponse> get(@PathVariable UUID id) {
        return ApiResponse.success(BillResponse.from(service.get(id)));
    }

    @PostMapping
    public ApiResponse<BillResponse> create(@Valid @RequestBody CreateBillRequest request) {
        return ApiResponse.success(BillResponse.from(service.create(request.toEntity(), request.toItems())));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<BillResponse> updateStatus(@PathVariable UUID id, @Valid @RequestBody UpdateBillStatusRequest request) {
        return ApiResponse.success(BillResponse.from(service.updateStatus(id, BillStatus.valueOf(request.status()))));
    }

    @PatchMapping("/{id}/payment")
    public ApiResponse<BillResponse> recordPayment(@PathVariable UUID id, @Valid @RequestBody RecordPaymentRequest request) {
        return ApiResponse.success(BillResponse.from(service.recordPayment(id, request.amount(), PaymentMethod.valueOf(request.paymentMethod()), request.note())));
    }

    @GetMapping("/stats/dashboard")
    public ApiResponse<BillService.DashboardStats> stats() {
        return ApiResponse.success(service.dashboardStats());
    }

    private UUID uuid(String value) {
        return value == null || value.isBlank() ? null : UUID.fromString(value);
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

record CreateBillRequest(
        String customerId,
        @NotBlank String customerName,
        String customerPhone,
        String customerGstin,
        @NotBlank String status,
        boolean isInterState,
        boolean isGstEnabled,
        @NotEmpty List<CreateBillLineItemRequest> lineItems,
        long amountPaid,
        @NotBlank String paymentMethod,
        String paymentDetails,
        String notes
) {
    Bill toEntity() {
        Bill bill = new Bill();
        bill.setCustomerId(customerId == null || customerId.isBlank() ? null : UUID.fromString(customerId));
        bill.setCustomerName(customerName);
        bill.setCustomerPhone(customerPhone);
        bill.setCustomerGstin(customerGstin);
        bill.setStatus(BillStatus.valueOf(status));
        bill.setInterState(isInterState);
        bill.setGstEnabled(isGstEnabled);
        bill.setAmountPaid(amountPaid);
        bill.setPaymentMethod(PaymentMethod.valueOf(paymentMethod));
        bill.setPaymentDetails(paymentDetails);
        bill.setNotes(notes);
        return bill;
    }

    List<BillItem> toItems() {
        return lineItems.stream().map(line -> {
            BillItem item = new BillItem();
            item.setProductId(UUID.fromString(line.productId()));
            item.setQuantity(line.quantity());
            item.setUnitPrice(line.unitPrice());
            item.setDiscountPercent(line.discountPercent());
            item.setHsnCode(line.hsnCode());
            item.setGstSlab(GstSlab.fromRate(line.gstSlab()));
            return item;
        }).toList();
    }
}

record CreateBillLineItemRequest(
        @NotBlank String productId,
        String productName,
        String sku,
        @Positive int quantity,
        @Positive long unitPrice,
        int discountPercent,
        int gstSlab,
        @NotBlank String hsnCode
) {
}

record UpdateBillStatusRequest(@NotBlank String status) {
}

record RecordPaymentRequest(@Positive long amount, @NotBlank String paymentMethod, String note) {
}

record BillResponse(
        String id, String billNumber, String customerId, String customerName, String customerPhone, String customerGstin, String status,
        boolean isInterState, boolean isGstEnabled, List<BillLineResponse> lineItems, long subtotal, long totalDiscount,
        long totalCgst, long totalSgst, long totalIgst, long totalGst, long roundOff, long grandTotal, long amountPaid,
        long balanceDue, String paymentMethod, String paymentDetails, String notes, String createdAt, String updatedAt
) {
    static BillResponse from(Bill bill) {
        return new BillResponse(bill.getId().toString(), bill.getBillNumber(),
                bill.getCustomerId() != null ? bill.getCustomerId().toString() : null, bill.getCustomerName(), bill.getCustomerPhone(),
                bill.getCustomerGstin(), bill.getStatus().name(), bill.isInterState(), bill.isGstEnabled(),
                bill.getLineItems().stream().map(item -> new BillLineResponse(item.getId().toString(), item.getProductId().toString(),
                        item.getProductName(), item.getSku(), item.getQuantity(), item.getUnitPrice(), item.getDiscountPercent(),
                        item.getDiscountAmount(), item.getTaxableAmount(), item.getCgst(), item.getSgst(), item.getIgst(),
                        item.getLineTotal(), item.getHsnCode(), item.getGstSlab().getRate())).toList(),
                bill.getSubtotal(), bill.getTotalDiscount(), bill.getTotalCgst(), bill.getTotalSgst(), bill.getTotalIgst(),
                bill.getTotalGst(), bill.getRoundOff(), bill.getGrandTotal(), bill.getAmountPaid(), bill.getBalanceDue(),
                bill.getPaymentMethod().name(), bill.getPaymentDetails(), bill.getNotes(), bill.getCreatedAt().toString(), bill.getUpdatedAt().toString());
    }
}

record BillLineResponse(
        String id, String productId, String productName, String sku, int quantity, long unitPrice, int discountPercent,
        long discountAmount, long taxableAmount, long cgst, long sgst, long igst, long lineTotal, String hsnCode, int gstSlab
) {
}
