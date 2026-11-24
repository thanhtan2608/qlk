package org.example.qlk_be.application.usecase;

import org.example.qlk_be.domain.model.User;

import java.util.List;

public interface UserUseCase {

    List<User> getAllUsers();

    User getUserById(Integer id);

    User getUserByUsername(String username);

    User createUser(String username, String rawPassword, Integer roleId);

    User updateUser(Integer id, String username, String rawPassword, Integer roleId, Integer status);

    User updateUserStatus(Integer id, int status);

    void deleteUser(Integer id);
}
