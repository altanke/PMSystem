package com.pmsystem.presentation.controller;

import com.pmsystem.application.exception.ResourceNotFoundException;
import com.pmsystem.domain.dto.UpdateProfileRequest;
import com.pmsystem.domain.dto.UpdateRoleRequest;
import com.pmsystem.domain.dto.UserProfileDto;
import com.pmsystem.domain.model.Role;
import com.pmsystem.infrastructure.persistence.entity.UserEntity;
import com.pmsystem.infrastructure.persistence.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class UserControllerTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserController userController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        SecurityContext context = mock(SecurityContext.class);
        Authentication auth = mock(Authentication.class);
        when(context.getAuthentication()).thenReturn(auth);
        when(auth.getName()).thenReturn("test@gmail.com");
        SecurityContextHolder.setContext(context);
    }

    @Test
    void getCurrentUser_ReturnsProfile() {
        UserEntity user = new UserEntity();
        user.setId(1L);
        user.setEmail("test@gmail.com");
        user.setRole(Role.USER);
        when(userRepository.findByEmail("test@gmail.com")).thenReturn(Optional.of(user));

        ResponseEntity<UserProfileDto> response = userController.getCurrentUser();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getEmail()).isEqualTo("test@gmail.com");
    }

    @Test
    void updateCurrentUser_UpdatesAndReturnsProfile() {
        UserEntity user = new UserEntity();
        user.setId(1L);
        user.setFirstName("Old");
        when(userRepository.findByEmail("test@gmail.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);

        UpdateProfileRequest request = new UpdateProfileRequest("NewFirst", "NewLast");
        ResponseEntity<UserProfileDto> response = userController.updateCurrentUser(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getFirstName()).isEqualTo("NewFirst");
    }

    @Test
    void getAllUsers_ReturnsList() {
        when(userRepository.findAllByEmailNot("admin@gmail.com")).thenReturn(List.of(new UserEntity()));
        ResponseEntity<List<UserProfileDto>> response = userController.getAllUsers();
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void updateUserRole_ProtectsSelfUpdate() {
        UserEntity currentUser = new UserEntity();
        currentUser.setId(1L);
        when(userRepository.findByEmail("test@gmail.com")).thenReturn(Optional.of(currentUser));

        ResponseEntity<UserProfileDto> response = userController.updateUserRole(1L, new UpdateRoleRequest("MANAGER"));
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }
    
    @Test
    void updateUserRole_Success() {
        UserEntity currentUser = new UserEntity();
        currentUser.setId(1L);
        currentUser.setEmail("test@gmail.com");
        when(userRepository.findByEmail("test@gmail.com")).thenReturn(Optional.of(currentUser));

        UserEntity targetUser = new UserEntity();
        targetUser.setId(2L);
        targetUser.setEmail("target@gmail.com");
        when(userRepository.findById(2L)).thenReturn(Optional.of(targetUser));

        ResponseEntity<UserProfileDto> response = userController.updateUserRole(2L, new UpdateRoleRequest("MANAGER"));
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(targetUser.getRole()).isEqualTo(Role.MANAGER);
    }
}
