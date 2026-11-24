package org.example.qlk_be.presentation.dto;

public class LoginResponse {
    private String token;
    private Integer id;
    private String username;
    private Integer roleId;
    private String roleCode;
    private String roleName;
    private int status;
    private long expiresIn; // seconds (86400)

    public LoginResponse() {}

    public LoginResponse(String token, Integer id, String username, Integer roleId, String roleCode, String roleName, int status, long expiresIn) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.roleId = roleId;
        this.roleCode = roleCode;
        this.roleName = roleName;
        this.status = status;
        this.expiresIn = expiresIn;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public Integer getRoleId() { return roleId; }
    public void setRoleId(Integer roleId) { this.roleId = roleId; }
    public String getRoleCode() { return roleCode; }
    public void setRoleCode(String roleCode) { this.roleCode = roleCode; }
    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
    public long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(long expiresIn) { this.expiresIn = expiresIn; }
}
