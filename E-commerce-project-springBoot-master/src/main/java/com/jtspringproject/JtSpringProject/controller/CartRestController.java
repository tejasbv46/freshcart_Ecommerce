package com.jtspringproject.JtSpringProject.controller;

import com.jtspringproject.JtSpringProject.models.Cart;
import com.jtspringproject.JtSpringProject.models.CartProduct;
import com.jtspringproject.JtSpringProject.models.Product;
import com.jtspringproject.JtSpringProject.models.User;
import com.jtspringproject.JtSpringProject.services.CartService;
import com.jtspringproject.JtSpringProject.services.ProductService;
import com.jtspringproject.JtSpringProject.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartRestController {

    private final CartService cartService;
    private final UserService userService;
    private final ProductService productService;

    public CartRestController(CartService cartService, UserService userService, ProductService productService) {
        this.cartService = cartService;
        this.userService = userService;
        this.productService = productService;
    }

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserByUsername(username);
    }

    @GetMapping
    public ResponseEntity<?> getCart() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        Cart cart = cartService.getOrCreateCart(user);
        List<CartProduct> items = cartService.getCartItems(cart);
        
        java.util.List<java.util.Map<String, Object>> response = new java.util.ArrayList<>();
        for (CartProduct cp : items) {
            java.util.Map<String, Object> itemMap = new java.util.HashMap<>();
            itemMap.put("quantity", cp.getQuantity());
            
            Product p = cp.getProduct();
            java.util.Map<String, Object> prodMap = new java.util.HashMap<>();
            prodMap.put("id", p.getId());
            prodMap.put("name", p.getName());
            prodMap.put("image", p.getImage());
            prodMap.put("price", p.getPrice());
            prodMap.put("stock", p.getQuantity());
            
            itemMap.put("product", prodMap);
            response.add(itemMap);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> getCartCount() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.ok(0);
        }
        Cart cart = cartService.getOrCreateCart(user);
        List<CartProduct> items = cartService.getCartItems(cart);
        int count = items.stream().mapToInt(CartProduct::getQuantity).sum();
        return ResponseEntity.ok(count);
    }

    @PostMapping("/add")
    public ResponseEntity<String> addProduct(
            @RequestParam("productId") int productId,
            @RequestParam("quantity") int quantity) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        Product product = productService.getProduct(productId);
        if (product == null) {
            return ResponseEntity.badRequest().body("Product not found");
        }

        Cart cart = cartService.getOrCreateCart(user);
        cartService.addProductToCart(cart, product, quantity);
        return ResponseEntity.ok("Success");
    }

    @PostMapping("/update")
    public ResponseEntity<String> updateQuantity(
            @RequestParam("productId") int productId,
            @RequestParam("quantity") int quantity) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        Product product = productService.getProduct(productId);
        if (product == null) {
            return ResponseEntity.badRequest().body("Product not found");
        }

        Cart cart = cartService.getOrCreateCart(user);
        cartService.updateCartProductQuantity(cart, product, quantity);
        return ResponseEntity.ok("Success");
    }

    @PostMapping("/remove")
    public ResponseEntity<String> removeProduct(@RequestParam("productId") int productId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        Product product = productService.getProduct(productId);
        if (product == null) {
            return ResponseEntity.badRequest().body("Product not found");
        }

        Cart cart = cartService.getOrCreateCart(user);
        cartService.removeProductFromCart(cart, product);
        return ResponseEntity.ok("Success");
    }
}
