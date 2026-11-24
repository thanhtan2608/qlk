package org.example.qlk_be.presentation.controller;

import org.example.qlk_be.application.usecase.UserUseCase;
import org.example.qlk_be.presentation.dto.CreateUserRequest;
import org.example.qlk_be.presentation.dto.UpdateUserRequest;
import org.example.qlk_be.presentation.dto.UpdateUserStatusRequest;
import org.example.qlk_be.presentation.dto.UserResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserUseCase userUseCase;

    public UserController(UserUseCase userUseCase) {
        this.userUseCase = userUseCase;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAll() {
        return ResponseEntity.ok(userUseCase.getAllUsers().stream().map(UserResponse::fromDomain).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(UserResponse.fromDomain(userUseCase.getUserById(id)));
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserResponse> getByUsername(@PathVariable String username) {
        return ResponseEntity.ok(UserResponse.fromDomain(userUseCase.getUserByUsername(username)));
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@RequestBody CreateUserRequest request) {
        var created = userUseCase.createUser(request.getUsername(), request.getPassword(), request.getRoleId());
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponse.fromDomain(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> update(@PathVariable Integer id, @RequestBody UpdateUserRequest request) {
        var updated = userUseCase.updateUser(id, request.getUsername(), request.getPassword(), request.getRoleId(), request.getStatus());
        return ResponseEntity.ok(UserResponse.fromDomain(updated));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UserResponse> updateStatus(@PathVariable Integer id, @RequestBody UpdateUserStatusRequest request) {
        var updated = userUseCase.updateUserStatus(id, request.getStatus());
        return ResponseEntity.ok(UserResponse.fromDomain(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        userUseCase.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
