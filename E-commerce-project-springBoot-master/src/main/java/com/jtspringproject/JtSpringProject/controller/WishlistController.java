package com.jtspringproject.JtSpringProject.controller;

import com.jtspringproject.JtSpringProject.models.Product;
import com.jtspringproject.JtSpringProject.models.User;
import com.jtspringproject.JtSpringProject.services.ProductService;
import com.jtspringproject.JtSpringProject.services.UserService;
import com.jtspringproject.JtSpringProject.services.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;
    private final UserService userService;
    private final ProductService productService;

    public WishlistController(WishlistService wishlistService, UserService userService, ProductService productService) {
        this.wishlistService = wishlistService;
        this.userService = userService;
        this.productService = productService;
    }

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserByUsername(username);
    }

    @PostMapping("/add")
    public ResponseEntity<String> addToWishlist(@RequestParam("productId") int productId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        Product product = productService.getProduct(productId);
        if (product == null) {
            return ResponseEntity.badRequest().body("Product not found");
        }
        wishlistService.addToWishlist(user, product);
        return ResponseEntity.ok("Success");
    }

    @PostMapping("/remove")
    public ResponseEntity<String> removeFromWishlist(@RequestParam("productId") int productId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        Product product = productService.getProduct(productId);
        if (product == null) {
            return ResponseEntity.badRequest().body("Product not found");
        }
        wishlistService.removeFromWishlist(user, product);
        return ResponseEntity.ok("Success");
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> isWishlisted(@RequestParam("productId") int productId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.ok(false);
        }
        Product product = productService.getProduct(productId);
        if (product == null) {
            return ResponseEntity.ok(false);
        }
        return ResponseEntity.ok(wishlistService.isWishlisted(user, product));
    }
}
