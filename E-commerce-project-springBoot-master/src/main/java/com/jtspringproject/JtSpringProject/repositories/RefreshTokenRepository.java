package com.jtspringproject.JtSpringProject.repositories;

import com.jtspringproject.JtSpringProject.models.RefreshToken;
import com.jtspringproject.JtSpringProject.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Integer> {
    Optional<RefreshToken> findByToken(String token);
    
    Optional<RefreshToken> findByUser(User user);

    @Modifying
    int deleteByUser(User user);
}
