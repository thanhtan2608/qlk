package org.example.qlk_be.application.service;

import org.example.qlk_be.application.usecase.UserUseCase;
import org.example.qlk_be.domain.exception.DuplicateResourceException;
import org.example.qlk_be.domain.exception.ResourceNotFoundException;
import org.example.qlk_be.domain.model.Role;
import org.example.qlk_be.domain.model.User;
import org.example.qlk_be.domain.repository.RoleRepository;
import org.example.qlk_be.domain.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class UserService implements UserUseCase {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", id));
    }

    @Override
    public User getUserByUsername(String username) {
        String normalizedUsername = validateAndNormalizeUsername(username);
        return userRepository.findByUsername(normalizedUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "username", normalizedUsername));
    }

    @Override
    @Transactional
    public User createUser(String username, String rawPassword, Integer roleId) {
        String normalizedUsername = validateAndNormalizeUsername(username);
        if (rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalArgumentException("Mật khẩu không được để trống");
        }
        if (roleId == null) {
            throw new IllegalArgumentException("Vai trò không được để trống");
        }
        if (userRepository.existsByUsername(normalizedUsername)) {
            throw new DuplicateResourceException("Người dùng", "username", normalizedUsername);
        }

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vai trò", "id", roleId));

        User user = new User(normalizedUsername, rawPassword, role.getId(), 1);
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User updateUser(Integer id, String username, String rawPassword, Integer roleId, Integer status) {
        User existing = getUserById(id);
        if (username != null && !username.isBlank()) {
            String normalizedUsername = validateAndNormalizeUsername(username);
            userRepository.findByUsername(normalizedUsername)
                    .filter(found -> !found.getId().equals(id))
                    .ifPresent(found -> {
                        throw new DuplicateResourceException("Người dùng", "username", normalizedUsername);
                    });
            existing.setUsername(normalizedUsername);
        }
        if (rawPassword != null && !rawPassword.isBlank()) {
            existing.setPassword(rawPassword);
        }
        if (roleId != null) {
            Role role = roleRepository.findById(roleId)
                    .orElseThrow(() -> new ResourceNotFoundException("Vai trò", "id", roleId));
            existing.setRoleId(role.getId());
        }
        if (status != null) {
            existing.setStatus(status);
        }
        return userRepository.save(existing);
    }

    @Override
    @Transactional
    public User updateUserStatus(Integer id, int status) {
        User existing = getUserById(id);
        existing.setStatus(status);
        return userRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteUser(Integer id) {
        User existing = getUserById(id);
        userRepository.deleteById(existing.getId());
    }

    private String validateAndNormalizeUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên đăng nhập không được để trống");
        }
        return username.trim();
    }
}
