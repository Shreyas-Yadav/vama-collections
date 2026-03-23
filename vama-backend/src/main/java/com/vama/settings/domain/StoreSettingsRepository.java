package com.vama.settings.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StoreSettingsRepository extends JpaRepository<StoreSettings, UUID> {
}
