package com.vama.sales.service;

import com.vama.common.model.GstSlab;
import com.vama.common.model.MoneyMath;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class BillCalculator {

    public BillCalculationResult calculate(List<BillLineInput> lines, boolean interState, boolean gstEnabled) {
        List<LineBreakdown> breakdowns = new ArrayList<>();
        long subtotal = 0;
        long totalDiscount = 0;
        long totalCgst = 0;
        long totalSgst = 0;
        long totalIgst = 0;

        for (BillLineInput line : lines) {
            long gross = line.quantity() * line.unitPrice();
            long discount = MoneyMath.percentage(gross, line.discountPercent());
            long taxable = gross - discount;
            long gstAmount = gstEnabled ? MoneyMath.percentage(taxable, line.gstSlab().getRate()) : 0;
            long cgst = 0;
            long sgst = 0;
            long igst = 0;
            if (gstEnabled) {
                if (interState) {
                    igst = gstAmount;
                } else {
                    cgst = Math.round(gstAmount / 2.0d);
                    sgst = gstAmount - cgst;
                }
            }
            long lineTotal = taxable + cgst + sgst + igst;
            breakdowns.add(new LineBreakdown(discount, taxable, cgst, sgst, igst, lineTotal));
            subtotal += taxable;
            totalDiscount += discount;
            totalCgst += cgst;
            totalSgst += sgst;
            totalIgst += igst;
        }

        long totalGst = totalCgst + totalSgst + totalIgst;
        long rawTotal = subtotal + totalGst;
        long roundOff = Math.round(rawTotal / 100.0d) * 100 - rawTotal;
        long grandTotal = rawTotal + roundOff;
        return new BillCalculationResult(breakdowns, subtotal, totalDiscount, totalCgst, totalSgst, totalIgst, totalGst, roundOff, grandTotal);
    }

    public record BillLineInput(int quantity, long unitPrice, int discountPercent, GstSlab gstSlab) {
    }

    public record LineBreakdown(long discountAmount, long taxableAmount, long cgst, long sgst, long igst, long lineTotal) {
    }

    public record BillCalculationResult(
            List<LineBreakdown> lines,
            long subtotal,
            long totalDiscount,
            long totalCgst,
            long totalSgst,
            long totalIgst,
            long totalGst,
            long roundOff,
            long grandTotal
    ) {
    }
}
