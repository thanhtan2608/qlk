package org.example.qlk_be.presentation.dto;

public class UpdateUserRequest {
    private String username;
    private String password;
    private Integer roleId;
    private Integer status;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Integer getRoleId() { return roleId; }
    public void setRoleId(Integer roleId) { this.roleId = roleId; }
    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
}
