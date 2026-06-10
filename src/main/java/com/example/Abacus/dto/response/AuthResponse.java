package com.example.Abacus.dto.response;

public record AuthResponse (

     String token,
     String email,
     String role

){}