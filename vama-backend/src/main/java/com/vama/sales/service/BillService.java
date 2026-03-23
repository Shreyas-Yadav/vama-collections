package com.vama.sales.service;

import com.vama.common.exception.ApiException;
import com.vama.common.model.PageQuery;
import com.vama.common.service.DocumentNumberService;
import com.vama.customer.service.CustomerService;
import com.vama.inventory.domain.Product;
import com.vama.inventory.domain.ProductRepository;
import com.vama.inventory.service.StockLedgerService;
import com.vama.sales.domain.Bill;
import com.vama.sales.domain.BillItem;
import com.vama.sales.domain.BillRepository;
import com.vama.sales.domain.BillStatus;
import com.vama.sales.domain.PaymentEvent;
import com.vama.sales.domain.PaymentEventRepository;
import com.vama.sales.domain.PaymentMethod;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class BillService {

    private static final Set<String> SORTS = Set.of("createdAt", "updatedAt", "billNumber", "grandTotal", "customerName", "balanceDue", "status");

    private final BillRepository repository;
    private final ProductRepository productRepository;
    private final PaymentEventRepository paymentEventRepository;
    private final DocumentNumberService documentNumberService;
    private final BillCalculator billCalculator;
    private final StockLedgerService stockLedgerService;
    private final CustomerService customerService;

    public BillService(BillRepository repository, ProductRepository productRepository, PaymentEventRepository paymentEventRepository, DocumentNumberService documentNumberService, BillCalculator billCalculator, StockLedgerService stockLedgerService, CustomerService customerService) {
        this.repository = repository;
        this.productRepository = productRepository;
        this.paymentEventRepository = paymentEventRepository;
        this.documentNumberService = documentNumberService;
        this.billCalculator = billCalculator;
        this.stockLedgerService = stockLedgerService;
        this.customerService = customerService;
    }

    @Transactional(readOnly = true)
    public Page<Bill> list(PageQuery query, String status, OffsetDateTime from, OffsetDateTime to, UUID customerId) {
        Specification<Bill> spec = (root, q, cb) -> {
            var predicate = cb.conjunction();
            if (query.search() != null && !query.search().isBlank()) {
                String pattern = "%" + query.search().toLowerCase() + "%";
                predicate = cb.and(predicate, cb.or(
                        cb.like(cb.lower(root.get("billNumber")), pattern),
                        cb.like(cb.lower(root.get("customerName")), pattern),
                        cb.like(cb.lower(root.get("customerPhone")), pattern)
                ));
            }
            if (status != null && !status.isBlank()) {
                predicate = cb.and(predicate, cb.equal(root.get("status"), BillStatus.valueOf(status)));
            }
            if (from != null) {
                predicate = cb.and(predicate, cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            }
            if (to != null) {
                predicate = cb.and(predicate, cb.lessThanOrEqualTo(root.get("createdAt"), to));
            }
            if (customerId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("customerId"), customerId));
            }
            return predicate;
        };
        return repository.findAll(spec, query.toPageable(SORTS, "createdAt"));
    }

    @Transactional(readOnly = true)
    public Bill get(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BILL_NOT_FOUND", "Bill not found"));
    }

    @Transactional
    public Bill create(Bill bill, List<BillItem> items) {
        bill.setBillNumber(documentNumberService.nextBillNumber());
        bill.getLineItems().clear();
        BillCalculator.BillCalculationResult totals = calculateAndHydrate(bill, items);
        if (bill.getAmountPaid() > totals.grandTotal()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "OVERPAYMENT", "Amount paid cannot exceed bill total", "amountPaid");
        }
        applyTotals(bill, totals);
        bill.setBalanceDue(bill.getGrandTotal() - bill.getAmountPaid());
        bill.setStatus(resolveStatus(bill.getAmountPaid(), bill.getGrandTotal(), bill.getStatus()));
        Bill saved = repository.save(bill);
        for (BillItem item : saved.getLineItems()) {
            stockLedgerService.issue(item.getProductId(), item.getQuantity(), saved.getId(), "BILL", "Bill issued");
        }
        if (saved.getAmountPaid() > 0) {
            PaymentEvent event = new PaymentEvent();
            event.setBillId(saved.getId());
            event.setAmount(saved.getAmountPaid());
            event.setPaymentMethod(saved.getPaymentMethod());
            event.setPaidAt(OffsetDateTime.now(ZoneOffset.UTC));
            paymentEventRepository.save(event);
        }
        customerService.applyPurchase(saved.getCustomerId(), saved.getGrandTotal());
        return saved;
    }

    @Transactional
    public Bill updateStatus(UUID id, BillStatus status) {
        Bill bill = get(id);
        if (bill.getStatus() == BillStatus.CANCELLED) {
            throw new ApiException(HttpStatus.CONFLICT, "BILL_CANCELLED", "Bill is already cancelled");
        }
        if (status == BillStatus.CANCELLED) {
            bill.setStatus(BillStatus.CANCELLED);
            for (BillItem item : bill.getLineItems()) {
                stockLedgerService.reverseSale(item.getProductId(), item.getQuantity(), bill.getId(), "BILL", "Bill cancelled");
            }
            return bill;
        }
        bill.setStatus(status);
        return bill;
    }

    @Transactional
    public Bill recordPayment(UUID id, long amount, PaymentMethod paymentMethod, String note) {
        Bill bill = get(id);
        if (bill.getStatus() == BillStatus.CANCELLED) {
            throw new ApiException(HttpStatus.CONFLICT, "BILL_CANCELLED", "Cannot record payment on a cancelled bill");
        }
        if (amount <= 0 || bill.getAmountPaid() + amount > bill.getGrandTotal()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_PAYMENT", "Invalid payment amount", "amount");
        }
        bill.setAmountPaid(bill.getAmountPaid() + amount);
        bill.setBalanceDue(bill.getGrandTotal() - bill.getAmountPaid());
        bill.setPaymentMethod(paymentMethod);
        bill.setStatus(resolveStatus(bill.getAmountPaid(), bill.getGrandTotal(), bill.getStatus()));
        PaymentEvent event = new PaymentEvent();
        event.setBillId(bill.getId());
        event.setAmount(amount);
        event.setPaymentMethod(paymentMethod);
        event.setNote(note);
        event.setPaidAt(OffsetDateTime.now(ZoneOffset.UTC));
        paymentEventRepository.save(event);
        return bill;
    }

    @Transactional(readOnly = true)
    public List<Bill> listByCustomer(UUID customerId) {
        return repository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    @Transactional(readOnly = true)
    public DashboardStats dashboardStats() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime startOfDay = now.toLocalDate().atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime startOfMonth = now.withDayOfMonth(1).toLocalDate().atStartOfDay().atOffset(ZoneOffset.UTC);
        List<Bill> todayBills = repository.findAll((root, q, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), startOfDay));
        List<Bill> monthBills = repository.findAll((root, q, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), startOfMonth));
        long todaySales = todayBills.stream().filter(b -> b.getStatus() != BillStatus.CANCELLED).mapToLong(Bill::getGrandTotal).sum();
        long monthSales = monthBills.stream().filter(b -> b.getStatus() != BillStatus.CANCELLED).mapToLong(Bill::getGrandTotal).sum();
        return new DashboardStats(todaySales, todayBills.size(), monthSales, monthBills.size());
    }

    private BillCalculator.BillCalculationResult calculateAndHydrate(Bill bill, List<BillItem> items) {
        List<BillCalculator.BillLineInput> inputs = items.stream().map(item -> new BillCalculator.BillLineInput(
                item.getQuantity(),
                item.getUnitPrice(),
                item.getDiscountPercent(),
                item.getGstSlab()
        )).toList();
        BillCalculator.BillCalculationResult result = billCalculator.calculate(inputs, bill.isInterState(), bill.isGstEnabled());
        bill.getLineItems().clear();
        for (int i = 0; i < items.size(); i++) {
            BillItem item = items.get(i);
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "PRODUCT_NOT_FOUND", "Product not found", "productId"));
            if (!product.isActive()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "PRODUCT_INACTIVE", "Inactive product cannot be billed");
            }
            BillCalculator.LineBreakdown line = result.lines().get(i);
            item.setBill(bill);
            item.setProductName(product.getName());
            item.setSku(product.getSku());
            item.setHsnCode(product.getHsnCode());
            item.setGstSlab(product.getGstSlab());
            item.setDiscountAmount(line.discountAmount());
            item.setTaxableAmount(line.taxableAmount());
            item.setCgst(line.cgst());
            item.setSgst(line.sgst());
            item.setIgst(line.igst());
            item.setLineTotal(line.lineTotal());
            bill.getLineItems().add(item);
        }
        return result;
    }

    private void applyTotals(Bill bill, BillCalculator.BillCalculationResult totals) {
        bill.setSubtotal(totals.subtotal());
        bill.setTotalDiscount(totals.totalDiscount());
        bill.setTotalCgst(totals.totalCgst());
        bill.setTotalSgst(totals.totalSgst());
        bill.setTotalIgst(totals.totalIgst());
        bill.setTotalGst(totals.totalGst());
        bill.setRoundOff(totals.roundOff());
        bill.setGrandTotal(totals.grandTotal());
    }

    private BillStatus resolveStatus(long amountPaid, long grandTotal, BillStatus requestedStatus) {
        if (requestedStatus == BillStatus.CANCELLED) {
            return BillStatus.CANCELLED;
        }
        if (amountPaid >= grandTotal) {
            return BillStatus.PAID;
        }
        if (amountPaid > 0) {
            return BillStatus.PARTIALLY_PAID;
        }
        return BillStatus.DRAFT;
    }

    public record DashboardStats(long todaySales, int todayBills, long monthSales, int monthBills) {
    }
}
