package com.jtspringproject.JtSpringProject.services;

import com.jtspringproject.JtSpringProject.models.Wishlist;
import com.jtspringproject.JtSpringProject.models.User;
import com.jtspringproject.JtSpringProject.models.Product;
import java.util.List;

public interface WishlistService {
    List<Wishlist> getWishlistByUser(User user);
    Wishlist addToWishlist(User user, Product product);
    void removeFromWishlist(User user, Product product);
    boolean isWishlisted(User user, Product product);
}
