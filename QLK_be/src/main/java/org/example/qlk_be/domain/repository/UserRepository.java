package org.example.qlk_be.domain.repository;

import org.example.qlk_be.domain.model.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository {

    List<User> findAll();

    Optional<User> findById(Integer id);

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    User save(User user);

    void deleteById(Integer id);
}