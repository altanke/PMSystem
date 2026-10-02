package com.pmsystem.infrastructure.security;

import com.pmsystem.domain.model.Role;
import com.pmsystem.infrastructure.persistence.entity.UserEntity;
import com.pmsystem.infrastructure.persistence.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    private static final String FRONTEND_BASE = "http://localhost:5173";

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = token.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String firstName = oAuth2User.getAttribute("given_name");
        String lastName = oAuth2User.getAttribute("family_name");

        log.info("OAuth2 success callback — email: {}", email);

        if (email == null) {
            log.error("OAuth2 user has no email attribute");
            getRedirectStrategy().sendRedirect(request, response,
                    FRONTEND_BASE + "/login?error=no_email");
            return;
        }

        try {

            UserEntity user = userRepository.findByEmail(email).orElseGet(() -> {
                log.info("Creating new user from OAuth2 login: {}", email);
                String username = email.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 6);
                UserEntity newUser = UserEntity.builder()
                        .email(email)
                        .username(username)
                        .firstName(firstName != null ? firstName : "")
                        .lastName(lastName != null ? lastName : "")
                        .passwordHash(UUID.randomUUID().toString())
                        .role(Role.USER)
                        .build();
                return userRepository.save(newUser);
            });

            String jwtToken = jwtService.generateToken(user);
            log.info("OAuth2 JWT generated successfully for: {}", email);

            getRedirectStrategy().sendRedirect(request, response,
                    FRONTEND_BASE + "/oauth2/redirect?token=" + jwtToken);

        } catch (Exception e) {
            log.error("OAuth2 post-auth error for {}: {}", email, e.getMessage(), e);
            e.printStackTrace();
            getRedirectStrategy().sendRedirect(request, response,
                    FRONTEND_BASE + "/login?error=oauth2_backend_error");
        }
    }
}
