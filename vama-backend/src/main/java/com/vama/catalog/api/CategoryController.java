package com.vama.catalog.api;

import com.vama.catalog.domain.Category;
import com.vama.catalog.service.CategoryService;
import com.vama.common.api.ApiResponse;
import com.vama.common.api.PaginatedResponse;
import com.vama.common.model.PageQuery;
import com.vama.common.service.PageResponseFactory;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final CategoryService service;
    private final PageResponseFactory pageResponseFactory;

    public CategoryController(CategoryService service, PageResponseFactory pageResponseFactory) {
        this.service = service;
        this.pageResponseFactory = pageResponseFactory;
    }

    @GetMapping
    public PaginatedResponse<CategoryResponse> list(@RequestParam(defaultValue = "1") int page,
                                                    @RequestParam(defaultValue = "20") int pageSize,
                                                    @RequestParam(required = false) String search) {
        return pageResponseFactory.create(service.list(new PageQuery(page, pageSize, search, "name", "asc")), CategoryResponse::from);
    }

    @GetMapping("/all")
    public ApiResponse<List<CategoryResponse>> all() {
        return ApiResponse.success(service.allActive().stream().map(CategoryResponse::from).toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<CategoryResponse> get(@PathVariable UUID id) {
        return ApiResponse.success(CategoryResponse.from(service.get(id)));
    }

    @PostMapping
    public ApiResponse<CategoryResponse> create(@Valid @RequestBody CategoryRequest request) {
        return ApiResponse.success(CategoryResponse.from(service.create(request.toEntity())));
    }

    @PatchMapping("/{id}")
    public ApiResponse<CategoryResponse> update(@PathVariable UUID id, @Valid @RequestBody CategoryRequest request) {
        return ApiResponse.success(CategoryResponse.from(service.update(id, request.toEntity())));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}

record CategoryRequest(@NotBlank String name, String parentId, String description, boolean isActive) {
    Category toEntity() {
        Category category = new Category();
        category.setName(name);
        category.setParentId(parentId == null || parentId.isBlank() ? null : UUID.fromString(parentId));
        category.setDescription(description);
        category.setActive(isActive);
        return category;
    }
}

record CategoryResponse(
        String id, String name, String slug, String parentId, String description, long productCount, boolean isActive, String createdAt, String updatedAt
) {
    static CategoryResponse from(Category category) {
        return new CategoryResponse(category.getId().toString(), category.getName(), category.getSlug(),
                category.getParentId() != null ? category.getParentId().toString() : null, category.getDescription(), 0,
                category.isActive(), category.getCreatedAt().toString(), category.getUpdatedAt().toString());
    }
}
