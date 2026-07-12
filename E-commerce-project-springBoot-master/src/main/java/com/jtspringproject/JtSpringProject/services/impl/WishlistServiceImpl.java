package com.jtspringproject.JtSpringProject.services.impl;

import com.jtspringproject.JtSpringProject.models.Wishlist;
import com.jtspringproject.JtSpringProject.models.User;
import com.jtspringproject.JtSpringProject.models.Product;
import com.jtspringproject.JtSpringProject.repositories.WishlistRepository;
import com.jtspringproject.JtSpringProject.services.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;

    @Autowired
    public WishlistServiceImpl(WishlistRepository wishlistRepository) {
        this.wishlistRepository = wishlistRepository;
    }

    @Override
    public List<Wishlist> getWishlistByUser(User user) {
        return wishlistRepository.findByUserId(user.getId());
    }

    @Override
    @Transactional
    public Wishlist addToWishlist(User user, Product product) {
        if (!wishlistRepository.existsByUserIdAndProductId(user.getId(), product.getId())) {
            Wishlist item = new Wishlist(user, product);
            return wishlistRepository.save(item);
        }
        return wishlistRepository.findByUserIdAndProductId(user.getId(), product.getId()).orElse(null);
    }

    @Override
    @Transactional
    public void removeFromWishlist(User user, Product product) {
        wishlistRepository.deleteByUserIdAndProductId(user.getId(), product.getId());
    }

    @Override
    public boolean isWishlisted(User user, Product product) {
        return wishlistRepository.existsByUserIdAndProductId(user.getId(), product.getId());
    }
}
