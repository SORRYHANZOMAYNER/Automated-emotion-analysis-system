package com.database.services;

import com.database.config.security.JwtService;
import com.database.dto.TokenDTO;
import com.database.modules.User;
import com.database.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import javax.security.sasl.AuthenticationException;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private final UserRepository userRepository;
    @Autowired
    private AuthenticationManager authenticationManager;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Transactional
    public User save(User user) {
        System.out.println("user for reg " + user);
        System.out.println("users password " + passwordEncoder.encode(user.getPassword()));
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return user;
    }

    @Transactional
    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }

    public TokenDTO authenticate(String login, String password) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(login, password)
            );
            User user = userRepository.findByLogin(login);
            String accessToken = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            System.out.println("Access Token: " + accessToken);
            System.out.println("Refresh Token: " + refreshToken);

            return new TokenDTO(accessToken, refreshToken);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Token generation failed: " + e.getMessage());
            return null;
        }
    }
    public User findByLogin(String login) {
        return userRepository.findByLogin(login);
    }

    @Transactional
    public void updateUser(User updatedUser) {
        User existingUser = userRepository.findById(updatedUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        existingUser.setLogin(updatedUser.getLogin());
        userRepository.save(existingUser);
    }

    public TokenDTO refreshToken(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new AuthenticationException("No JWT token");
        }
        String token = authorizationHeader.substring(7);
        String login = jwtService.extractUsername(token);
        User user = userRepository.findByLogin(login);
        if (jwtService.validate(token)) {
            String accessToken = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);
            return new TokenDTO(accessToken, refreshToken);
        }
        return null;
    }
}