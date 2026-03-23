package com.vama.purchase.api;

import com.vama.common.api.ApiResponse;
import com.vama.common.api.PaginatedResponse;
import com.vama.common.model.GstSlab;
import com.vama.common.model.PageQuery;
import com.vama.common.service.PageResponseFactory;
import com.vama.purchase.domain.PoStatus;
import com.vama.purchase.domain.PurchaseOrder;
import com.vama.purchase.domain.PurchaseOrderItem;
import com.vama.purchase.service.PurchaseOrderService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/purchase-orders")
public class PurchaseOrderController {

    private final PurchaseOrderService service;
    private final PageResponseFactory pageResponseFactory;

    public PurchaseOrderController(PurchaseOrderService service, PageResponseFactory pageResponseFactory) {
        this.service = service;
        this.pageResponseFactory = pageResponseFactory;
    }

    @GetMapping
    public PaginatedResponse<PurchaseOrderResponse> list(@RequestParam(defaultValue = "1") int page,
                                                         @RequestParam(defaultValue = "20") int pageSize,
                                                         @RequestParam(required = false) String search,
                                                         @RequestParam(required = false) String status,
                                                         @RequestParam(required = false) String sortBy,
                                                         @RequestParam(required = false) String sortDir) {
        return pageResponseFactory.create(service.list(new PageQuery(page, pageSize, search, sortBy == null ? "orderDate" : sortBy, sortDir), status), PurchaseOrderResponse::from);
    }

    @GetMapping("/{id}")
    public ApiResponse<PurchaseOrderResponse> get(@PathVariable UUID id) {
        return ApiResponse.success(PurchaseOrderResponse.from(service.get(id)));
    }

    @PostMapping
    public ApiResponse<PurchaseOrderResponse> create(@Valid @RequestBody CreatePurchaseOrderRequest request) {
        return ApiResponse.success(PurchaseOrderResponse.from(service.create(request.toEntity(), request.toItems())));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<PurchaseOrderResponse> updateStatus(@PathVariable UUID id, @Valid @RequestBody UpdatePoStatusRequest request) {
        return ApiResponse.success(PurchaseOrderResponse.from(service.updateStatus(id, PoStatus.valueOf(request.status()))));
    }

    @PostMapping("/{id}/receipts")
    public ApiResponse<PurchaseOrderResponse> receive(@PathVariable UUID id, @Valid @RequestBody ReceivePurchaseOrderRequest request) {
        List<PurchaseOrderService.ReceiptLine> lines = request.lineItems().stream()
                .map(line -> new PurchaseOrderService.ReceiptLine(UUID.fromString(line.lineItemId()), line.quantity()))
                .toList();
        return ApiResponse.success(PurchaseOrderResponse.from(service.receive(id, lines)));
    }
}

record CreatePurchaseOrderRequest(
        @NotBlank String vendorId,
        @NotBlank String status,
        @NotNull LocalDate orderDate,
        LocalDate expectedDeliveryDate,
        long discountAmount,
        String notes,
        @NotEmpty List<CreatePoLineItemRequest> lineItems
) {
    PurchaseOrder toEntity() {
        PurchaseOrder order = new PurchaseOrder();
        order.setVendorId(UUID.fromString(vendorId));
        order.setStatus(PoStatus.valueOf(status));
        order.setOrderDate(orderDate);
        order.setExpectedDeliveryDate(expectedDeliveryDate);
        order.setDiscountAmount(discountAmount);
        order.setNotes(notes);
        return order;
    }

    List<PurchaseOrderItem> toItems() {
        return lineItems.stream().map(line -> {
            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setProductId(UUID.fromString(line.productId()));
            item.setQuantity(line.quantity());
            item.setReceivedQuantity(0);
            item.setUnitCost(line.unitCost());
            item.setGstSlab(GstSlab.fromRate(line.gstSlab()));
            item.setHsnCode(line.hsnCode());
            return item;
        }).toList();
    }
}

record CreatePoLineItemRequest(@NotBlank String productId, @Positive int quantity, @Positive long unitCost, int gstSlab, @NotBlank String hsnCode) {
}

record UpdatePoStatusRequest(@NotBlank String status) {
}

record ReceivePurchaseOrderRequest(@NotEmpty List<ReceivePurchaseOrderLineRequest> lineItems) {
}

record ReceivePurchaseOrderLineRequest(@NotBlank String lineItemId, @Positive int quantity) {
}

record PurchaseOrderResponse(
        String id, String poNumber, String vendorId, String vendorName, String status, String orderDate, String expectedDeliveryDate,
        String receivedDate, List<PurchaseOrderLineResponse> lineItems, long subtotal, long totalGst, long totalAmount,
        long discountAmount, String notes, String createdAt, String updatedAt
) {
    static PurchaseOrderResponse from(PurchaseOrder order) {
        return new PurchaseOrderResponse(order.getId().toString(), order.getPoNumber(), order.getVendorId().toString(), order.getVendorName(),
                order.getStatus().name(), order.getOrderDate().toString(),
                order.getExpectedDeliveryDate() != null ? order.getExpectedDeliveryDate().toString() : null,
                order.getReceivedDate() != null ? order.getReceivedDate().toString() : null,
                order.getLineItems().stream().map(line -> new PurchaseOrderLineResponse(line.getId().toString(), line.getProductId().toString(),
                        line.getProductName(), line.getSku(), line.getQuantity(), line.getReceivedQuantity(), line.getUnitCost(),
                        line.getTotalCost(), line.getGstSlab().getRate(), line.getHsnCode())).toList(),
                order.getSubtotal(), order.getTotalGst(), order.getTotalAmount(), order.getDiscountAmount(), order.getNotes(),
                order.getCreatedAt().toString(), order.getUpdatedAt().toString());
    }
}

record PurchaseOrderLineResponse(String id, String productId, String productName, String sku, int quantity, int receivedQuantity,
                                 long unitCost, long totalCost, int gstSlab, String hsnCode) {
}
