package com.database.modules;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "UserNet")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, unique = true)
    private String login;
    private String phone;
    private String email;
    @Column(nullable = false)
    private String password;
    @Column(nullable = true)
    private String avatar;
    @OneToMany(fetch = FetchType.EAGER, mappedBy = "creator",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<Appeal> appeals = new ArrayList<>();
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getUsername() {
        return "";
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }
    public void addAppeal(Appeal appeal) {
        if (this.appeals == null) {
            this.appeals = new ArrayList<>();
        }
        appeal.setCreator(this);
    }
    public void removeAppeal(Appeal appeal) {
        if (this.appeals != null){
            appeals.remove(appeal);
            appeal.setCreator(null);
        }
    }
}