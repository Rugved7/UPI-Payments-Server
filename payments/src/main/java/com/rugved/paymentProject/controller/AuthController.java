package com.rugved.paymentProject.controller;

import com.rugved.paymentProject.dto.ApiResponse;
import com.rugved.paymentProject.dto.JwtResponse;
import com.rugved.paymentProject.dto.LoginRequest;
import com.rugved.paymentProject.dto.SignupRequest;
import com.rugved.paymentProject.security.UserPrincipal;
import com.rugved.paymentProject.security.jwt.JwtUtils;
import com.rugved.paymentProject.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        if (authService.existsByEmail(signupRequest.getEmail())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email already in use"));
        }
        if (authService.existsByPhone(signupRequest.getPhone())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Phone already in use"));
        }
        var user = authService.registerUser(signupRequest);
        return ResponseEntity.ok().body(ApiResponse.success("User registered successfully", user));
    }

    @GetMapping("/check-email")
    public ResponseEntity<ApiResponse> checkEmailActivity(@RequestParam String email) {
        boolean avaliable = !authService.existsByEmail(email);
        return ResponseEntity.ok().body(ApiResponse.success("Email avaliablity checked", avaliable));
    }

    @GetMapping("/check-phone")
    public ResponseEntity<ApiResponse> checkPhoneAvailability(@RequestParam String phone) {
        boolean available = !authService.existsByPhone(phone);
        return ResponseEntity.ok()
                .body(ApiResponse.success("Phone availability checked", available));
    }


    //    Login Endpoint
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserPrincipal userDetails = (UserPrincipal) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return ResponseEntity.ok(new JwtResponse(jwt, userDetails.getId(), userDetails.getUsername(), roles));
    }
}
