package com.vama.common.api;

import java.util.List;

public record PaginatedResponse<T>(
        List<T> data,
        long total,
        int page,
        int pageSize,
        int totalPages
) {
}
