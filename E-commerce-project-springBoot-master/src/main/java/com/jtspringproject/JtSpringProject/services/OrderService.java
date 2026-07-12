package com.jtspringproject.JtSpringProject.services;

import com.jtspringproject.JtSpringProject.models.Cart;
import com.jtspringproject.JtSpringProject.models.Coupon;
import com.jtspringproject.JtSpringProject.models.Order;
import com.jtspringproject.JtSpringProject.models.User;
import java.util.List;
import java.util.Optional;

public interface OrderService {
    List<Order> getOrdersByUser(User user);
    List<Order> getAllOrders();
    Order getOrderById(int orderId);
    Order saveOrder(Order order);
    Order createOrder(User user, Cart cart, String shippingAddress, String paymentMethod, String couponCode);
    Optional<Coupon> validateCoupon(String code, int subtotal);
}
