package com.vama.common.service;

import com.vama.common.api.PaginatedResponse;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Function;

@Component
public class PageResponseFactory {

    public <T, R> PaginatedResponse<R> create(Page<T> page, Function<T, R> mapper) {
        List<R> data = page.getContent().stream().map(mapper).toList();
        return new PaginatedResponse<>(data, page.getTotalElements(), page.getNumber() + 1, page.getSize(), page.getTotalPages());
    }
}
