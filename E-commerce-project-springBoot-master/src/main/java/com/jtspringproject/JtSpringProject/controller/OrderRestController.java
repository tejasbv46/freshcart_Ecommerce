package com.jtspringproject.JtSpringProject.controller;

import com.jtspringproject.JtSpringProject.models.Cart;
import com.jtspringproject.JtSpringProject.models.Order;
import com.jtspringproject.JtSpringProject.models.User;
import com.jtspringproject.JtSpringProject.services.CartService;
import com.jtspringproject.JtSpringProject.services.EmailService;
import com.jtspringproject.JtSpringProject.services.OrderService;
import com.jtspringproject.JtSpringProject.services.UserService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@Validated
public class OrderRestController {

    private final OrderService orderService;
    private final UserService userService;
    private final CartService cartService;
    private final EmailService emailService;

    public OrderRestController(OrderService orderService, UserService userService, CartService cartService, EmailService emailService) {
        this.orderService = orderService;
        this.userService = userService;
        this.cartService = cartService;
        this.emailService = emailService;
    }

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserByUsername(username);
    }

    @GetMapping
    public ResponseEntity<List<Order>> getOrders() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Collections.emptyList());
        }
        return ResponseEntity.ok(orderService.getOrdersByUser(user));
    }

    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(
            @RequestParam("shippingAddress") @NotBlank(message = "Shipping address is required") String shippingAddress,
            @RequestParam("paymentMethod") @NotBlank(message = "Payment method is required") String paymentMethod,
            @RequestParam(value = "couponCode", required = false) String couponCode) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        try {
            Cart cart = cartService.getOrCreateCart(user);
            Order order = orderService.createOrder(user, cart, shippingAddress, paymentMethod, couponCode);
            
            // Trigger order receipt email asynchronously
            emailService.sendOrderReceiptEmail(user, order);
            
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
