package org.example.qlk_be.presentation.controller;

import org.example.qlk_be.domain.repository.RoleRepository;
import org.example.qlk_be.presentation.dto.RoleResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "*")
public class RoleController {

    private final RoleRepository roleRepository;

    public RoleController(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @GetMapping
    public ResponseEntity<List<RoleResponse>> getAll() {
        var roles = roleRepository.findAll().stream().map(RoleResponse::fromDomain).toList();
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleResponse> getById(@PathVariable Integer id) {
        return roleRepository.findById(id)
                .map(RoleResponse::fromDomain)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
