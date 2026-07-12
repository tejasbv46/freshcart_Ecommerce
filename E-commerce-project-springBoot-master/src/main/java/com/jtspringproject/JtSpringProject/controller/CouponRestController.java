package com.jtspringproject.JtSpringProject.controller;

import com.jtspringproject.JtSpringProject.models.Coupon;
import com.jtspringproject.JtSpringProject.services.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/coupon")
public class CouponRestController {

    private final OrderService orderService;

    public CouponRestController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/validate")
    public ResponseEntity<Coupon> validateCoupon(
            @RequestParam("code") String code,
            @RequestParam("subtotal") int subtotal) {
        Optional<Coupon> coupon = orderService.validateCoupon(code, subtotal);
        return coupon.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.badRequest().build());
    }
}
