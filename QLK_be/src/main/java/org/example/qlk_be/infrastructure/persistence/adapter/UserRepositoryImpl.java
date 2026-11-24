package org.example.qlk_be.infrastructure.persistence.adapter;

import org.example.qlk_be.domain.model.User;
import org.example.qlk_be.domain.repository.UserRepository;
import org.example.qlk_be.infrastructure.persistence.entity.UserJpaEntity;
import org.example.qlk_be.infrastructure.persistence.repository.SpringDataUserJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class UserRepositoryImpl implements UserRepository {

    private final SpringDataUserJpaRepository jpaRepository;

    public UserRepositoryImpl(SpringDataUserJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<User> findAll() {
        return jpaRepository.findAll().stream().map(UserJpaEntity::toDomain).toList();
    }

    @Override
    public Optional<User> findById(Integer id) {
        return jpaRepository.findById(id).map(UserJpaEntity::toDomain);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return jpaRepository.findByUsername(username).map(UserJpaEntity::toDomain);
    }

    @Override
    public boolean existsByUsername(String username) {
        return jpaRepository.existsByUsername(username);
    }

    @Override
    public User save(User user) {
        return jpaRepository.save(UserJpaEntity.fromDomain(user)).toDomain();
    }

    @Override
    public void deleteById(Integer id) {
        jpaRepository.deleteById(id);
    }
}