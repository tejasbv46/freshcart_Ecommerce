package com.jtspringproject.JtSpringProject.services;

import com.jtspringproject.JtSpringProject.models.RefreshToken;
import com.jtspringproject.JtSpringProject.models.User;
import com.jtspringproject.JtSpringProject.repositories.RefreshTokenRepository;
import com.jtspringproject.JtSpringProject.repositories.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;

@Service
public class JwtService {

    // A secure 256-bit signing key encoded in Base64Url
    private static final String DEFAULT_SECRET = "M2NmYTc2ZjE4MzkzZTExNzZiNmQ1ZjdmOThlNzI3NjcyMTVmOWQxMjM0YmM1ZTY3ODlmMWEyM2I0YzVkNmU3Zg";

    private final SecretKey signingKey;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    @Value("${jwt.accessTokenExpirationMs:900000}") // 15 minutes
    private long accessTokenExpirationMs;

    @Value("${jwt.refreshTokenExpirationMs:604800000}") // 7 days
    private long refreshTokenExpirationMs;

    public JwtService(
            @Value("${jwt.secret:}") String secretKey,
            RefreshTokenRepository refreshTokenRepository,
            UserRepository userRepository) {
        String secret = secretKey.isEmpty() ? DEFAULT_SECRET : secretKey;
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64URL.decode(secret));
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String generateAccessToken(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpirationMs))
                .signWith(signingKey)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    // Refresh Token management
    @Transactional
    public RefreshToken createRefreshToken(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            throw new IllegalArgumentException("User not found: " + username);
        }

        // Delete existing refresh tokens for the user to prevent duplication
        refreshTokenRepository.deleteByUser(user);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenExpirationMs));

        return refreshTokenRepository.save(refreshToken);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token was expired. Please make a new signin request.");
        }
        return token;
    }
}
