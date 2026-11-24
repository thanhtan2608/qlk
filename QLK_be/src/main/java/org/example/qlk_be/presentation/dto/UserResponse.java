package org.example.qlk_be.presentation.dto;

import org.example.qlk_be.domain.model.User;

public class UserResponse {
    private Integer id;
    private String username;
    private Integer roleId;
    private int status;

    public static UserResponse fromDomain(User u) {
        UserResponse res = new UserResponse();
        res.id = u.getId();
        res.username = u.getUsername();
        res.roleId = u.getRoleId();
        res.status = u.getStatus();
        return res;
    }

    public Integer getId() { return id; }
    public String getUsername() { return username; }
    public Integer getRoleId() { return roleId; }
    public int getStatus() { return status; }
}