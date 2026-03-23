package com.vama.sales.service;

import com.vama.common.model.GstSlab;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class BillCalculatorTest {

    private final BillCalculator calculator = new BillCalculator();

    @Test
    void calculatesIntraStateBillTotals() {
        BillCalculator.BillCalculationResult result = calculator.calculate(
                List.of(new BillCalculator.BillLineInput(2, 10_000, 10, GstSlab.FIVE)),
                false,
                true
        );

        assertThat(result.subtotal()).isEqualTo(18_000);
        assertThat(result.totalDiscount()).isEqualTo(2_000);
        assertThat(result.totalCgst()).isEqualTo(450);
        assertThat(result.totalSgst()).isEqualTo(450);
        assertThat(result.totalIgst()).isZero();
        assertThat(result.grandTotal()).isEqualTo(18_900);
    }

    @Test
    void calculatesInterStateWithoutGstWhenDisabled() {
        BillCalculator.BillCalculationResult result = calculator.calculate(
                List.of(new BillCalculator.BillLineInput(1, 12_345, 0, GstSlab.EIGHTEEN)),
                true,
                false
        );

        assertThat(result.totalGst()).isZero();
        assertThat(result.roundOff()).isEqualTo(-45);
        assertThat(result.grandTotal()).isEqualTo(12_300);
    }
}
