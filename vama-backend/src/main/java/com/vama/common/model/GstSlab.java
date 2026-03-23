package com.vama.common.model;

public enum GstSlab {
    ZERO(0),
    FIVE(5),
    TWELVE(12),
    EIGHTEEN(18),
    TWENTY_EIGHT(28);

    private final int rate;

    GstSlab(int rate) {
        this.rate = rate;
    }

    public int getRate() {
        return rate;
    }

    public static GstSlab fromRate(int rate) {
        for (GstSlab slab : values()) {
            if (slab.rate == rate) {
                return slab;
            }
        }
        throw new IllegalArgumentException("Unsupported GST slab: " + rate);
    }
}
