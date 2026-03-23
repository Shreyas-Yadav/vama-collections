package com.vama.common.api;

public record ApiError(String message, String code, String field) {
}
