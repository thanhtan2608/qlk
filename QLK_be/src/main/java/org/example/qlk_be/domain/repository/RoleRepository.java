package org.example.qlk_be.domain.repository;

import org.example.qlk_be.domain.model.Role;

import java.util.List;
import java.util.Optional;

public interface RoleRepository {

    List<Role> findAll();

    Optional<Role> findById(Integer id);

    Optional<Role> findByRoleCode(String roleCode);

    Role save(Role role);
}