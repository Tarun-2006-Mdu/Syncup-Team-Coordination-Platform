package com.example.demo.service;

import com.example.demo.dto.AuthRequestDto;
import com.example.demo.dto.AuthResponseDto;
import com.example.demo.dto.RegisterDto;
import com.example.demo.entity.SystemUser;
import com.example.demo.repository.SystemUserRepository;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final SystemUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;

    public AuthService(
            SystemUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager,
            CustomUserDetailsService userDetailsService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    // =========================
    // REGISTER
    // =========================
    public AuthResponseDto register(RegisterDto request) {

        // Null request validation
        if (request == null) {
            throw new IllegalArgumentException(
                    "Registration details are required."
            );
        }

        // =========================
        // USERNAME VALIDATION
        // =========================

        String username = request.getUsername();

        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Username is required."
            );
        }

        username = username.trim();

        if (username.length() < 3) {
            throw new IllegalArgumentException(
                    "Username must contain at least 3 characters."
            );
        }

        if (username.length() > 30) {
            throw new IllegalArgumentException(
                    "Username must not exceed 30 characters."
            );
        }

        if (!username.matches("^[a-zA-Z0-9_]+$")) {
            throw new IllegalArgumentException(
                    "Username can contain only letters, numbers, and underscores."
            );
        }

        // Check duplicate username
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException(
                    "Username already exists."
            );
        }

        // =========================
        // EMAIL VALIDATION
        // =========================

        String email = request.getEmail();

        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Email is required."
            );
        }

        email = email.trim().toLowerCase();

        if (!email.matches(
                "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {

            throw new IllegalArgumentException(
                    "Please enter a valid email address."
            );
        }

        if (email.length() > 100) {
            throw new IllegalArgumentException(
                    "Email must not exceed 100 characters."
            );
        }

        // Check duplicate email
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "Email already exists."
            );
        }

        // =========================
        // PASSWORD VALIDATION
        // =========================

        String password = request.getPassword();

        if (password == null || password.isEmpty()) {
            throw new IllegalArgumentException(
                    "Password is required."
            );
        }

        // Minimum 8 characters
        if (password.length() < 8) {
            throw new IllegalArgumentException(
                    "Password must contain at least 8 characters."
            );
        }

        // BCrypt supports passwords up to 72 characters
        if (password.length() > 72) {
            throw new IllegalArgumentException(
                    "Password must not exceed 72 characters."
            );
        }

        // At least one uppercase letter
        if (!password.matches(".*[A-Z].*")) {
            throw new IllegalArgumentException(
                    "Password must contain at least one uppercase letter."
            );
        }

        // At least one lowercase letter
        if (!password.matches(".*[a-z].*")) {
            throw new IllegalArgumentException(
                    "Password must contain at least one lowercase letter."
            );
        }

        // At least one number
        if (!password.matches(".*[0-9].*")) {
            throw new IllegalArgumentException(
                    "Password must contain at least one number."
            );
        }

        // At least one special character
        if (!password.matches(".*[^a-zA-Z0-9].*")) {
            throw new IllegalArgumentException(
                    "Password must contain at least one special character."
            );
        }

        // =========================
        // ROLE VALIDATION
        // =========================

        if (request.getRole() == null) {
            throw new IllegalArgumentException(
                    "Role is required."
            );
        }

        // =========================
        // CREATE USER
        // =========================

        SystemUser user = SystemUser.builder()
                .username(username)
                .email(email)
                .password(
                        passwordEncoder.encode(password)
                )
                .role(request.getRole())
                .build();

        userRepository.save(user);

        // =========================
        // LOAD USER DETAILS
        // =========================

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(
                        username
                );

        // =========================
        // GENERATE JWT
        // =========================

        String jwtToken =
                jwtService.generateToken(userDetails);

        // =========================
        // RETURN RESPONSE
        // =========================

        return AuthResponseDto.builder()
                .token(jwtToken)
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }

    // =========================
    // LOGIN
    // =========================
    public AuthResponseDto login(AuthRequestDto request) {

        // =========================
        // INPUT VALIDATION
        // =========================

        if (request == null) {
            throw new IllegalArgumentException(
                    "Please enter your username and password."
            );
        }

        String username = request.getUsername();
        String password = request.getPassword();

        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Please enter your username and password."
            );
        }

        if (password == null || password.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please enter your username and password."
            );
        }

        username = username.trim();

        // =========================
        // AUTHENTICATE USER
        // =========================

        try {

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            username,
                            password
                    )
            );

        } catch (AuthenticationException ex) {

            /*
             * Never expose raw Spring Security messages
             * such as "Bad credentials" to the user.
             *
             * Also do not reveal whether the username
             * or password was incorrect.
             */
            throw new IllegalArgumentException(
                    "Invalid username or password. Please check your credentials and try again."
            );
        }

        // =========================
        // LOAD USER DETAILS
        // =========================

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(
                        username
                );

        // =========================
        // LOAD USER FROM DATABASE
        // =========================

        SystemUser user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Invalid username or password. Please check your credentials and try again."
                                )
                        );

        // =========================
        // GENERATE JWT
        // =========================

        String jwtToken =
                jwtService.generateToken(userDetails);

        // =========================
        // RETURN RESPONSE
        // =========================

        return AuthResponseDto.builder()
                .token(jwtToken)
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }
}