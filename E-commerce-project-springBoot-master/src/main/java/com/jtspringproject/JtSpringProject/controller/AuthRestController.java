package com.jtspringproject.JtSpringProject.controller;

import com.jtspringproject.JtSpringProject.models.RefreshToken;
import com.jtspringproject.JtSpringProject.models.User;
import com.jtspringproject.JtSpringProject.services.EmailService;
import com.jtspringproject.JtSpringProject.services.JwtService;
import com.jtspringproject.JtSpringProject.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthRestController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final EmailService emailService;
    private final JwtService jwtService;

    public AuthRestController(AuthenticationManager authenticationManager, UserService userService, EmailService emailService, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.emailService = emailService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Establish the session for cookie persistence (optional fallback)
            HttpSession session = request.getSession(true);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
            
            User user = userService.getUserByUsername(loginRequest.getUsername());
            session.setAttribute("user", user);
            session.setAttribute("username", user.getUsername());

            // Generate JWT credentials
            String accessToken = jwtService.generateAccessToken(user.getUsername());
            RefreshToken refreshToken = jwtService.createRefreshToken(user.getUsername());

            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("role", user.getRole());
            response.put("address", user.getAddress());
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken.getToken());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid username or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> requestBody) {
        String requestRefreshToken = requestBody.get("refreshToken");
        if (requestRefreshToken == null) {
            return ResponseEntity.badRequest().body("Refresh token is missing");
        }

        java.util.Optional<RefreshToken> tokenOpt = jwtService.findByToken(requestRefreshToken);
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Refresh token is invalid or expired");
        }

        try {
            RefreshToken verifiedToken = jwtService.verifyExpiration(tokenOpt.get());
            User user = verifiedToken.getUser();
            String accessToken = jwtService.generateAccessToken(user.getUsername());

            Map<String, String> response = new HashMap<>();
            response.put("accessToken", accessToken);
            response.put("refreshToken", requestRefreshToken);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        if (userService.getUserByUsername(registerRequest.getUsername()) != null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Username is already taken");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        User newUser = new User();
        newUser.setUsername(registerRequest.getUsername());
        newUser.setEmail(registerRequest.getEmail());
        newUser.setPassword(registerRequest.getPassword());
        newUser.setAddress(registerRequest.getAddress());
        newUser.setRole("ROLE_USER");

        User savedUser = userService.addUser(newUser);
        
        // Trigger welcome email asynchronously
        emailService.sendWelcomeEmail(savedUser);

        Map<String, Object> response = new HashMap<>();
        response.put("id", savedUser.getId());
        response.put("username", savedUser.getUsername());
        response.put("email", savedUser.getEmail());
        response.put("role", savedUser.getRole());
        response.put("address", savedUser.getAddress());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        User user = userService.getUserByUsername(principal.getName());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("address", user.getAddress());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }

    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        private String username;
        private String email;
        private String password;
        private String address;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
    }
}
