package com.jtspringproject.JtSpringProject.repositories;

import com.jtspringproject.JtSpringProject.models.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Integer> {
    List<Wishlist> findByUserId(int userId);
    Optional<Wishlist> findByUserIdAndProductId(int userId, int productId);
    void deleteByUserIdAndProductId(int userId, int productId);
    boolean existsByUserIdAndProductId(int userId, int productId);
}
