package com.vama.common.model;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Set;

public record PageQuery(
        int page,
        int pageSize,
        String search,
        String sortBy,
        String sortDir
) {

    public Pageable toPageable(Set<String> allowedSorts, String defaultSort) {
        String normalizedSort = allowedSorts.contains(sortBy) ? sortBy : defaultSort;
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return PageRequest.of(Math.max(page - 1, 0), Math.max(pageSize, 1), Sort.by(direction, normalizedSort));
    }
}
