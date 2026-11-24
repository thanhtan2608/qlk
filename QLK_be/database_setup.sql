-- Tạo cơ sở dữ liệu nếu chưa có
CREATE DATABASE IF NOT EXISTS `warehouse_management_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `warehouse_management_db`;

-- 1. Bảng Vai trò (roles)
CREATE TABLE IF NOT EXISTS `roles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `role_code` VARCHAR(50) NOT NULL UNIQUE,
    `role_name` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng Người dùng (users)
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role_id` INT NOT NULL,
    `status` INT NOT NULL DEFAULT 1,
    CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng Danh mục sản phẩm (categories)
CREATE TABLE IF NOT EXISTS `categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `category_name` VARCHAR(150) NOT NULL UNIQUE,
    `description` VARCHAR(500)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng Sản phẩm (products)
CREATE TABLE IF NOT EXISTS `products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_code` VARCHAR(100) NOT NULL UNIQUE,
    `name` VARCHAR(255) NOT NULL,
    `category_id` INT NOT NULL,
    `quantity` INT NOT NULL DEFAULT 0,
    `updated_at` DATETIME NULL,
    CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bảng Lịch sử Nhập kho (imports)
CREATE TABLE IF NOT EXISTS `imports` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `quantity` INT NOT NULL,
    `import_date` DATE NOT NULL,
    `import_time` TIME NOT NULL,
    `user_id` INT NOT NULL,
    CONSTRAINT `fk_imports_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bảng Lịch sử Xuất kho (exports)
CREATE TABLE IF NOT EXISTS `exports` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `quantity` INT NOT NULL,
    `export_date` DATE NOT NULL,
    `export_time` TIME NOT NULL,
    `user_id` INT NOT NULL,
    CONSTRAINT `fk_exports_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dữ liệu mẫu khởi tạo
INSERT IGNORE INTO `roles` (`id`, `role_code`, `role_name`) VALUES
(1, 'ADMIN', 'Quản trị viên (Admin)'),
(2, 'MANAGER', 'Quản lý kho (Manager)'),
(3, 'STAFF', 'Nhân viên kho (Staff)');

-- Mật khẩu mặc định: admin123, quanly123, nhanvien123
INSERT IGNORE INTO `users` (`id`, `username`, `password`, `role_id`, `status`) VALUES
(1, 'admin', 'admin123', 1, 1),
(2, 'quanly', 'quanly123', 2, 1),
(3, 'nhanvien', 'nhanvien123', 3, 1);

-- Danh mục mẫu
INSERT IGNORE INTO `categories` (`id`, `category_name`, `description`) VALUES
(1, 'Điện tử & Linh kiện', 'Các sản phẩm thiết bị số, linh kiện máy tính'),
(2, 'Thiết bị gia dụng', 'Đồ điện gia dụng, quạt, nồi chiên'),
(3, 'Văn phòng phẩm', 'Giấy in, bút, kẹp tài liệu'),
(4, 'Đồ đóng gói', 'Băng keo, thùng carton, màng xốp bubble');

-- Sản phẩm mẫu
INSERT IGNORE INTO `products` (`id`, `product_code`, `name`, `category_id`, `quantity`, `updated_at`) VALUES
(1, 'SP-001', 'Chuột không dây Logitech M330 Silent', 1, 45, NOW()),
(2, 'SP-002', 'Bàn phím cơ DareU EK87 Tenkeyless', 1, 28, NOW()),
(3, 'SP-003', 'Cáp sạc Type-C Anker PowerLine 1.8m', 1, 120, NOW()),
(4, 'SP-004', 'Nồi chiên không dầu Philips 4.5L', 2, 15, NOW()),
(5, 'SP-005', 'Quạt đứng Panasonic F-409KBE', 2, 8, NOW()),
(6, 'SP-006', 'Giấy in Double A A4 70gsm (Ram 500 tờ)', 3, 250, NOW()),
(7, 'SP-007', 'Bút bi Thiên Long 0.5mm xanh (Hộp 20 cây)', 3, 300, NOW()),
(8, 'SP-008', 'Thùng carton 3 lớp 30x20x15cm', 4, 500, NOW()),
(9, 'SP-009', 'Cuộn màng xốp hơi bubble 50cm x 100m', 4, 40, NOW()),
(10, 'SP-010', 'Băng keo trong OPP 4.8cm x 100 yard', 4, 180, NOW());

-- Lịch sử nhập mẫu
INSERT IGNORE INTO `imports` (`id`, `product_code`, `name`, `quantity`, `import_date`, `import_time`, `user_id`) VALUES
(1, 'SP-001', 'Chuột không dây Logitech M330 Silent', 50, CURDATE(), '08:30:00', 2),
(2, 'SP-003', 'Cáp sạc Type-C Anker PowerLine 1.8m', 100, CURDATE(), '09:15:00', 3),
(3, 'SP-006', 'Giấy in Double A A4 70gsm (Ram 500 tờ)', 200, CURDATE(), '10:00:00', 3);

-- Lịch sử xuất mẫu
INSERT IGNORE INTO `exports` (`id`, `product_code`, `name`, `quantity`, `export_date`, `export_time`, `user_id`) VALUES
(1, 'SP-001', 'Chuột không dây Logitech M330 Silent', 5, CURDATE(), '13:45:00', 3),
(2, 'SP-006', 'Giấy in Double A A4 70gsm (Ram 500 tờ)', 50, CURDATE(), '14:20:00', 3);
