package org.example.qlk_be.presentation.controller;

import org.example.qlk_be.domain.model.Role;
import org.example.qlk_be.domain.model.User;
import org.example.qlk_be.domain.repository.RoleRepository;
import org.example.qlk_be.domain.repository.UserRepository;
import org.example.qlk_be.presentation.dto.LoginRequest;
import org.example.qlk_be.presentation.dto.LoginResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    public AuthController(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank() ||
            request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Tên đăng nhập và mật khẩu không được để trống"));
        }

        String username = request.getUsername().trim();
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Tài khoản hoặc mật khẩu không chính xác"));
        }

        User user = userOpt.get();

        // Kiểm tra mật khẩu (hỗ trợ cả mật khẩu trực tiếp và mã hóa SHA-256)
        boolean passwordMatch = user.getPassword().equals(request.getPassword())
                || hashSha256(request.getPassword()).equals(user.getPassword());

        if (!passwordMatch) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Tài khoản hoặc mật khẩu không chính xác"));
        }

        if (!user.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Tài khoản đã bị khóa. Vui lòng liên hệ Quản trị viên"));
        }

        Role role = roleRepository.findById(user.getRoleId())
                .orElse(new Role(user.getRoleId(), "UNKNOWN", "Không xác định"));

        // Tạo token duy trì 1 ngày (86,400 giây = 24 giờ)
        long expirationSeconds = jwtExpirationMs / 1000;
        String tokenPayload = user.getId() + ":" + user.getUsername() + ":" + role.getRoleCode() + ":" + (System.currentTimeMillis() + jwtExpirationMs);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenPayload.getBytes(StandardCharsets.UTF_8));

        LoginResponse response = new LoginResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getRoleId(),
                role.getRoleCode(),
                role.getRoleName(),
                user.getStatus(),
                expirationSeconds
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Chưa đăng nhập"));
        }

        try {
            String token = authHeader.substring(7);
            byte[] decoded = Base64.getUrlDecoder().decode(token);
            String payload = new String(decoded, StandardCharsets.UTF_8);
            String[] parts = payload.split(":");
            if (parts.length < 4) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Token không hợp lệ"));
            }

            long expireTime = Long.parseLong(parts[3]);
            if (System.currentTimeMillis() > expireTime) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Phiên đăng nhập 1 ngày đã hết hạn"));
            }

            Integer userId = Integer.parseInt(parts[0]);
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty() || !userOpt.get().isActive()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Tài khoản không tồn tại hoặc đã bị khóa"));
            }

            User user = userOpt.get();
            Role role = roleRepository.findById(user.getRoleId())
                    .orElse(new Role(user.getRoleId(), "UNKNOWN", "Không xác định"));

            LoginResponse response = new LoginResponse(
                    token,
                    user.getId(),
                    user.getUsername(),
                    user.getRoleId(),
                    role.getRoleCode(),
                    role.getRoleName(),
                    user.getStatus(),
                    (expireTime - System.currentTimeMillis()) / 1000
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Token không hợp lệ"));
        }
    }

    private String hashSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return input;
        }
    }
}
