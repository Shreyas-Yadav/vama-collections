package com.vama.common.service;

import java.util.Locale;

public final class EnumMapper {

    private EnumMapper() {
    }

    public static String toFrontend(Enum<?> value) {
        String[] parts = value.name().toLowerCase(Locale.ROOT).split("_");
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            if (i > 0) {
                result.append(' ');
            }
            result.append(Character.toUpperCase(parts[i].charAt(0))).append(parts[i].substring(1));
        }
        return result.toString();
    }

    public static <T extends Enum<T>> T fromFrontend(Class<T> type, String value) {
        return Enum.valueOf(type, value.trim().replace(' ', '_').replace('-', '_').toUpperCase(Locale.ROOT));
    }
}
