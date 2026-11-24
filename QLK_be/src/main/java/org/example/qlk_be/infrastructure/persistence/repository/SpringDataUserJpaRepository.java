package org.example.qlk_be.infrastructure.persistence.repository;

import org.example.qlk_be.infrastructure.persistence.entity.UserJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SpringDataUserJpaRepository extends JpaRepository<UserJpaEntity, Integer> {
    Optional<UserJpaEntity> findByUsername(String username);
    boolean existsByUsername(String username);
}