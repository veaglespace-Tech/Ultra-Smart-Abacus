package com.example.Abacus.controller;


import com.example.Abacus.dto.request.LoginRequest;
import com.example.Abacus.dto.request.RegisterRequest;
import com.example.Abacus.dto.response.AuthResponse;
import com.example.Abacus.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(
            @RequestBody @Valid RegisterRequest request) {

        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(
            @RequestBody @Valid LoginRequest request) {

        return authService.login(request);
    }


}