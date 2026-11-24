package org.example.qlk_be.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.qlk_be.domain.model.User;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class UserJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "username", nullable = false, unique = true, length = 100)
    private String username;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "role_id", nullable = false)
    private Integer roleId;

    @Column(name = "status", nullable = false)
    private int status;

    public static UserJpaEntity fromDomain(User user) {
        if (user == null) {
            return null;
        }
        UserJpaEntity entity = new UserJpaEntity();
        entity.setId(user.getId());
        entity.setUsername(user.getUsername());
        entity.setPassword(user.getPassword());
        entity.setRoleId(user.getRoleId());
        entity.setStatus(user.getStatus());
        return entity;
    }

    public User toDomain() {
        return new User(this.id, this.username, this.password, this.roleId, this.status);
    }
}