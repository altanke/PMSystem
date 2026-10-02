package com.pmsystem.presentation.controller;

import com.pmsystem.application.exception.ResourceNotFoundException;
import com.pmsystem.domain.dto.UpdateProfileRequest;
import com.pmsystem.domain.dto.UpdateRoleRequest;
import com.pmsystem.domain.dto.UserProfileDto;
import com.pmsystem.domain.model.Role;
import com.pmsystem.infrastructure.persistence.entity.UserEntity;
import com.pmsystem.infrastructure.persistence.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management endpoints")
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<UserProfileDto> getCurrentUser() {
        UserEntity user = resolveCurrentUser();
        return ResponseEntity.ok(toDto(user));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user firstName and lastName")
    public ResponseEntity<UserProfileDto> updateCurrentUser(@RequestBody UpdateProfileRequest request) {
        UserEntity user = resolveCurrentUser();

        if (request.firstName() != null) user.setFirstName(request.firstName());
        if (request.lastName() != null) user.setLastName(request.lastName());

        userRepository.save(user);
        return ResponseEntity.ok(toDto(user));
    }

    private static final String ROOT_ADMIN_EMAIL = "admin@gmail.com";

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get all users (ADMIN/MANAGER only)")
    public ResponseEntity<List<UserProfileDto>> getAllUsers() {
        List<UserProfileDto> users = userRepository.findAllByEmailNot(ROOT_ADMIN_EMAIL)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a user's role (ADMIN only)")
    public ResponseEntity<UserProfileDto> updateUserRole(
            @PathVariable Long id,
            @RequestBody UpdateRoleRequest request) {

        UserEntity currentUser = resolveCurrentUser();
        if (currentUser.getId().equals(id)) {
            return ResponseEntity.badRequest().build();
        }

        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        if (ROOT_ADMIN_EMAIL.equalsIgnoreCase(user.getEmail())) {
            return ResponseEntity.status(403).build();
        }

        user.setRole(Role.valueOf(request.role().toUpperCase()));
        userRepository.save(user);

        return ResponseEntity.ok(toDto(user));
    }

    private UserEntity resolveCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private UserProfileDto toDto(UserEntity user) {
        return new UserProfileDto(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getUsername(),
                user.getRole() != null ? user.getRole().name() : null
        );
    }
}
