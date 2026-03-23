package com.vama.common.service;

import org.springframework.stereotype.Service;

@Service
public class SlugService {

    public String slugify(String input) {
        return input == null ? "" : input.toLowerCase()
                .trim()
                .replaceAll("\\s+", "-")
                .replaceAll("[^a-z0-9-]", "");
    }
}
