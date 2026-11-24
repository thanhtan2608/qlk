package org.example.qlk_be.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.qlk_be.domain.model.Role;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
public class RoleJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "role_code", nullable = false, unique = true, length = 50)
    private String roleCode;

    @Column(name = "role_name", nullable = false, length = 100)
    private String roleName;

    public static RoleJpaEntity fromDomain(Role role) {
        if (role == null) {
            return null;
        }
        RoleJpaEntity entity = new RoleJpaEntity();
        entity.setId(role.getId());
        entity.setRoleCode(role.getRoleCode());
        entity.setRoleName(role.getRoleName());
        return entity;
    }

    public Role toDomain() {
        return new Role(this.id, this.roleCode, this.roleName);
    }
}