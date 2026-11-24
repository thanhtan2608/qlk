package org.example.qlk_be.domain.model;

public class User {

    private Integer id;
    private String username;
    private String password;
    private Integer roleId;
    private int status; // 1: Hoạt động, 0: Khóa

    public User() {
        this.status = 1;
    }

    public User(Integer id, String username, String password, Integer roleId, int status) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.roleId = roleId;
        this.status = status;
    }

    public User(String username, String password, Integer roleId, int status) {
        this.username = username;
        this.password = password;
        this.roleId = roleId;
        this.status = status;
    }

    public boolean isActive() {
        return this.status == 1;
    }

    public void activate() {
        this.status = 1;
    }

    public void lock() {
        this.status = 0;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Integer getRoleId() {
        return roleId;
    }

    public void setRoleId(Integer roleId) {
        this.roleId = roleId;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        if (status != 0 && status != 1) {
            throw new IllegalArgumentException("Trạng thái tài khoản chỉ nhận giá trị 0 hoặc 1");
        }
        this.status = status;
    }
}