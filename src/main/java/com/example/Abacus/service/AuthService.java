package com.example.Abacus.service;


import com.example.Abacus.dto.request.LoginRequest;
import com.example.Abacus.dto.request.RegisterRequest;
import com.example.Abacus.dto.response.AuthResponse;
import com.example.Abacus.entity.User;
import com.example.Abacus.repository.UserRepo;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepo userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;


    // Register User
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(request.role())
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail(),user.getRole());

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getRole().name()
        );
    }

    // Login
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() ->
                        new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(
                request.password(),
                user.getPassword())) {

            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getEmail(),user.getRole());

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getRole().name()
        );
    }

}