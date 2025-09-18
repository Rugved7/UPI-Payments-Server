package com.rugved.paymentProject.security.impl;

import com.rugved.paymentProject.dto.SignupRequest;
import com.rugved.paymentProject.model.ERole;
import com.rugved.paymentProject.model.Role;
import com.rugved.paymentProject.model.User;
import com.rugved.paymentProject.repository.RoleRepository;
import com.rugved.paymentProject.repository.UserRepository;
import com.rugved.paymentProject.security.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public User registerUser(SignupRequest signupRequest) {
        User user = User.builder()
                .firstName(signupRequest.getFirstname())
                .lastName(signupRequest.getLastname())
                .email(signupRequest.getEmail())
                .phone(signupRequest.getPhone())
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .isVerified(false)
                .isLocked(false)
                .build();

        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        roles.add(userRole);
        user.setRoles(roles);

        return userRepository.save(user);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByPhone(String phone) {
        return userRepository.existsByPhone(phone);
    }
}
