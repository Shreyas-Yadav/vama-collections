package com.vama.catalog.service;

import com.vama.catalog.domain.Category;
import com.vama.catalog.domain.CategoryRepository;
import com.vama.common.exception.ApiException;
import com.vama.common.model.PageQuery;
import com.vama.common.service.SlugService;
import com.vama.inventory.domain.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class CategoryService {

    private static final Set<String> SORTS = Set.of("name", "createdAt", "updatedAt");

    private final CategoryRepository repository;
    private final ProductRepository productRepository;
    private final SlugService slugService;

    public CategoryService(CategoryRepository repository, ProductRepository productRepository, SlugService slugService) {
        this.repository = repository;
        this.productRepository = productRepository;
        this.slugService = slugService;
    }

    @Transactional(readOnly = true)
    public Page<Category> list(PageQuery query) {
        Specification<Category> spec = (root, q, cb) -> query.search() == null || query.search().isBlank()
                ? cb.conjunction()
                : cb.like(cb.lower(root.get("name")), "%" + query.search().toLowerCase() + "%");
        return repository.findAll(spec, query.toPageable(SORTS, "name"));
    }

    @Transactional(readOnly = true)
    public List<Category> allActive() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Category get(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CATEGORY_NOT_FOUND", "Category not found"));
    }

    @Transactional
    public Category create(Category category) {
        String slug = uniqueSlug(slugService.slugify(category.getName()), null);
        category.setSlug(slug);
        return repository.save(category);
    }

    @Transactional
    public Category update(UUID id, Category payload) {
        Category existing = get(id);
        if (payload.getName() != null && !payload.getName().equals(existing.getName())) {
            existing.setName(payload.getName());
            existing.setSlug(uniqueSlug(slugService.slugify(payload.getName()), id));
        }
        if (payload.getParentId() != null || existing.getParentId() != null) {
            existing.setParentId(payload.getParentId());
        }
        existing.setDescription(payload.getDescription());
        existing.setActive(payload.isActive());
        return existing;
    }

    @Transactional
    public void delete(UUID id) {
        Category existing = get(id);
        if (repository.countByParentId(id) > 0 || productRepository.countByCategoryId(id) > 0) {
            throw new ApiException(HttpStatus.CONFLICT, "CATEGORY_IN_USE", "Category cannot be deleted");
        }
        repository.delete(existing);
    }

    private String uniqueSlug(String base, UUID currentId) {
        String slug = base;
        int suffix = 1;
        while (true) {
            Category existing = repository.findBySlug(slug).orElse(null);
            if (existing == null || existing.getId().equals(currentId)) {
                return slug;
            }
            slug = base + "-" + suffix++;
        }
    }
}
