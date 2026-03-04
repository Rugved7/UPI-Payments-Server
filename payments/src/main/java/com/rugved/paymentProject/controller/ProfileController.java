package com.rugved.paymentProject.controller;

import com.rugved.paymentProject.dto.ApiResponse;
import com.rugved.paymentProject.dto.PasswordChangeRequest;
import com.rugved.paymentProject.dto.ProfileUpdateRequest;
import com.rugved.paymentProject.dto.UserProfileResponse;
import com.rugved.paymentProject.exception.BusinessException;
import com.rugved.paymentProject.model.User;
import com.rugved.paymentProject.repository.UserRepository;
import com.rugved.paymentProject.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<ApiResponse> getProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BusinessException("User not found", 
                    BusinessException.ErrorCodes.USER_NOT_FOUND));
        
        UserProfileResponse response = UserProfileResponse.fromUser(user);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", response));
    }

    @PutMapping
    public ResponseEntity<ApiResponse> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new BusinessException("User not found", 
                        BusinessException.ErrorCodes.USER_NOT_FOUND));

            // Check if phone is already taken by another user
            if (!user.getPhone().equals(request.getPhone())) {
                if (userRepository.existsByPhone(request.getPhone())) {
                    throw new BusinessException("Phone number already in use", 
                        BusinessException.ErrorCodes.USER_NOT_FOUND);
                }
            }

            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setPhone(request.getPhone());
            
            userRepository.save(user);

            UserProfileResponse response = UserProfileResponse.fromUser(user);
            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(
            @Valid @RequestBody PasswordChangeRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new BusinessException("User not found", 
                        BusinessException.ErrorCodes.USER_NOT_FOUND));

            // Verify current password
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new BusinessException("Current password is incorrect", 
                    BusinessException.ErrorCodes.INVALID_UPI_PIN);
            }

            // Verify new password and confirm password match
            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                throw new BusinessException("New password and confirm password do not match", 
                    BusinessException.ErrorCodes.INVALID_TRANSACTION);
            }

            // Update password
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);

            return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse> deleteAccount(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new BusinessException("User not found", 
                        BusinessException.ErrorCodes.USER_NOT_FOUND));

            // Lock account instead of deleting
            user.setIsLocked(true);
            userRepository.save(user);

            return ResponseEntity.ok(ApiResponse.success("Account deactivated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
