package org.example.qlk_be.presentation.dto;

import org.example.qlk_be.domain.model.Role;

public class RoleResponse {
    private Integer id;
    private String roleCode;
    private String roleName;

    public static RoleResponse fromDomain(Role role) {
        if (role == null) return null;
        RoleResponse res = new RoleResponse();
        res.id = role.getId();
        res.roleCode = role.getRoleCode();
        res.roleName = role.getRoleName();
        return res;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getRoleCode() { return roleCode; }
    public void setRoleCode(String roleCode) { this.roleCode = roleCode; }
    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
}
