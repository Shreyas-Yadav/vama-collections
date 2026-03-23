package com.vama.purchase.service;

import com.vama.common.exception.ApiException;
import com.vama.common.model.GstSlab;
import com.vama.common.model.PageQuery;
import com.vama.common.service.DocumentNumberService;
import com.vama.inventory.domain.Product;
import com.vama.inventory.domain.ProductRepository;
import com.vama.inventory.service.StockLedgerService;
import com.vama.purchase.domain.PoStatus;
import com.vama.purchase.domain.PurchaseOrder;
import com.vama.purchase.domain.PurchaseOrderItem;
import com.vama.purchase.domain.PurchaseOrderRepository;
import com.vama.vendor.domain.Vendor;
import com.vama.vendor.domain.VendorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class PurchaseOrderService {

    private static final Set<String> SORTS = Set.of("orderDate", "createdAt", "updatedAt", "poNumber", "vendorName", "expectedDeliveryDate", "totalAmount", "status");

    private final PurchaseOrderRepository repository;
    private final VendorRepository vendorRepository;
    private final ProductRepository productRepository;
    private final DocumentNumberService documentNumberService;
    private final StockLedgerService stockLedgerService;

    public PurchaseOrderService(PurchaseOrderRepository repository, VendorRepository vendorRepository, ProductRepository productRepository, DocumentNumberService documentNumberService, StockLedgerService stockLedgerService) {
        this.repository = repository;
        this.vendorRepository = vendorRepository;
        this.productRepository = productRepository;
        this.documentNumberService = documentNumberService;
        this.stockLedgerService = stockLedgerService;
    }

    @Transactional(readOnly = true)
    public Page<PurchaseOrder> list(PageQuery query, String status) {
        Specification<PurchaseOrder> spec = (root, q, cb) -> {
            var predicate = cb.conjunction();
            if (query.search() != null && !query.search().isBlank()) {
                String pattern = "%" + query.search().toLowerCase() + "%";
                predicate = cb.and(predicate, cb.or(
                        cb.like(cb.lower(root.get("poNumber")), pattern),
                        cb.like(cb.lower(root.get("vendorName")), pattern)
                ));
            }
            if (status != null && !status.isBlank()) {
                predicate = cb.and(predicate, cb.equal(root.get("status"), PoStatus.valueOf(status)));
            }
            return predicate;
        };
        return repository.findAll(spec, query.toPageable(SORTS, "orderDate"));
    }

    @Transactional(readOnly = true)
    public PurchaseOrder get(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PO_NOT_FOUND", "Purchase order not found"));
    }

    @Transactional
    public PurchaseOrder create(PurchaseOrder purchaseOrder, List<PurchaseOrderItem> items) {
        if (!(purchaseOrder.getStatus() == PoStatus.DRAFT || purchaseOrder.getStatus() == PoStatus.SENT)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_PO_STATUS", "Purchase order can only be created as draft or sent");
        }
        Vendor vendor = vendorRepository.findById(purchaseOrder.getVendorId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "VENDOR_NOT_FOUND", "Vendor not found", "vendorId"));
        purchaseOrder.setPoNumber(documentNumberService.nextPoNumber());
        purchaseOrder.setVendorName(vendor.getName());
        hydrateItems(purchaseOrder, items);
        calculateTotals(purchaseOrder);
        return repository.save(purchaseOrder);
    }

    @Transactional
    public PurchaseOrder updateStatus(UUID id, PoStatus status) {
        PurchaseOrder order = get(id);
        if (order.getStatus() == PoStatus.RECEIVED || order.getStatus() == PoStatus.CANCELLED) {
            throw new ApiException(HttpStatus.CONFLICT, "PO_LOCKED", "Purchase order is locked");
        }
        if (status == PoStatus.CANCELLED && order.getLineItems().stream().anyMatch(line -> line.getReceivedQuantity() > 0)) {
            throw new ApiException(HttpStatus.CONFLICT, "PO_RECEIVED", "Cannot cancel a purchase order after receipt");
        }
        order.setStatus(status);
        return order;
    }

    @Transactional
    public PurchaseOrder receive(UUID id, List<ReceiptLine> lines) {
        PurchaseOrder order = get(id);
        if (order.getStatus() == PoStatus.CANCELLED || order.getStatus() == PoStatus.RECEIVED) {
            throw new ApiException(HttpStatus.CONFLICT, "PO_LOCKED", "Purchase order cannot receive items");
        }
        for (ReceiptLine receipt : lines) {
            PurchaseOrderItem item = order.getLineItems().stream()
                    .filter(line -> line.getId().equals(receipt.lineItemId()))
                    .findFirst()
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "PO_LINE_NOT_FOUND", "Purchase order line not found"));
            int pending = item.getQuantity() - item.getReceivedQuantity();
            if (receipt.quantity() <= 0 || receipt.quantity() > pending) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_RECEIPT_QTY", "Received quantity exceeds pending quantity");
            }
            item.setReceivedQuantity(item.getReceivedQuantity() + receipt.quantity());
            stockLedgerService.receive(item.getProductId(), receipt.quantity(), item.getUnitCost(), order.getId(), "PURCHASE_ORDER", "Purchase order receipt");
        }
        long totalReceived = order.getLineItems().stream().mapToLong(PurchaseOrderItem::getReceivedQuantity).sum();
        long totalOrdered = order.getLineItems().stream().mapToLong(PurchaseOrderItem::getQuantity).sum();
        order.setStatus(totalReceived == totalOrdered ? PoStatus.RECEIVED : PoStatus.PARTIALLY_RECEIVED);
        if (order.getStatus() == PoStatus.RECEIVED) {
            order.setReceivedDate(LocalDate.now());
        }
        return order;
    }

    private void hydrateItems(PurchaseOrder order, List<PurchaseOrderItem> items) {
        order.getLineItems().clear();
        for (PurchaseOrderItem item : items) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "PRODUCT_NOT_FOUND", "Product not found", "productId"));
            item.setPurchaseOrder(order);
            item.setProductName(product.getName());
            item.setSku(product.getSku());
            if (item.getReceivedQuantity() < 0) {
                item.setReceivedQuantity(0);
            }
            if (item.getGstSlab() == null) {
                item.setGstSlab(product.getGstSlab());
            }
            if (item.getHsnCode() == null) {
                item.setHsnCode(product.getHsnCode());
            }
            item.setTotalCost(item.getQuantity() * item.getUnitCost());
            order.getLineItems().add(item);
        }
    }

    private void calculateTotals(PurchaseOrder order) {
        long subtotal = order.getLineItems().stream().mapToLong(PurchaseOrderItem::getTotalCost).sum();
        long totalGst = order.getLineItems().stream().mapToLong(item -> Math.round(item.getTotalCost() * item.getGstSlab().getRate() / 100.0d)).sum();
        order.setSubtotal(subtotal);
        order.setTotalGst(totalGst);
        order.setTotalAmount(subtotal + totalGst - order.getDiscountAmount());
    }

    public record ReceiptLine(UUID lineItemId, int quantity) {
    }
}
