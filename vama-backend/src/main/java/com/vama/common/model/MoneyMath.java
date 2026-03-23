package com.vama.common.model;

public final class MoneyMath {

    private MoneyMath() {
    }

    public static long percentage(long amount, int percent) {
        return Math.round(amount * percent / 100.0d);
    }
}
