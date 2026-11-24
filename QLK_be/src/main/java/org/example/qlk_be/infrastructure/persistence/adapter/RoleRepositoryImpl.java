package org.example.qlk_be.infrastructure.persistence.adapter;

import org.example.qlk_be.domain.model.Role;
import org.example.qlk_be.domain.repository.RoleRepository;
import org.example.qlk_be.infrastructure.persistence.entity.RoleJpaEntity;
import org.example.qlk_be.infrastructure.persistence.repository.SpringDataRoleJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class RoleRepositoryImpl implements RoleRepository {

    private final SpringDataRoleJpaRepository jpaRepository;

    public RoleRepositoryImpl(SpringDataRoleJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<Role> findAll() {
        return jpaRepository.findAll().stream().map(RoleJpaEntity::toDomain).toList();
    }

    @Override
    public Optional<Role> findById(Integer id) {
        return jpaRepository.findById(id).map(RoleJpaEntity::toDomain);
    }

    @Override
    public Optional<Role> findByRoleCode(String roleCode) {
        return jpaRepository.findByRoleCode(roleCode).map(RoleJpaEntity::toDomain);
    }

    @Override
    public Role save(Role role) {
        return jpaRepository.save(RoleJpaEntity.fromDomain(role)).toDomain();
    }
}