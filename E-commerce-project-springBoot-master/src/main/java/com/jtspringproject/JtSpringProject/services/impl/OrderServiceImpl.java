package com.jtspringproject.JtSpringProject.services.impl;

import com.jtspringproject.JtSpringProject.models.*;
import com.jtspringproject.JtSpringProject.repositories.CouponRepository;
import com.jtspringproject.JtSpringProject.repositories.OrderRepository;
import com.jtspringproject.JtSpringProject.repositories.ProductRepository;
import com.jtspringproject.JtSpringProject.services.CartService;
import com.jtspringproject.JtSpringProject.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CouponRepository couponRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;

    @Autowired
    public OrderServiceImpl(OrderRepository orderRepository, CouponRepository couponRepository, 
                            ProductRepository productRepository, CartService cartService) {
        this.orderRepository = orderRepository;
        this.couponRepository = couponRepository;
        this.productRepository = productRepository;
        this.cartService = cartService;
    }

    @Override
    public List<Order> getOrdersByUser(User user) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(user.getId());
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public Order getOrderById(int orderId) {
        return orderRepository.findById(orderId).orElse(null);
    }

    @Override
    @Transactional
    public Order saveOrder(Order order) {
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order createOrder(User user, Cart cart, String shippingAddress, String paymentMethod, String couponCode) {
        List<CartProduct> cartItems = cartService.getCartItems(cart);
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        // Calculate totals & Validate inventory & Decrement stock
        int subtotal = 0;
        for (CartProduct item : cartItems) {
            Product product = item.getProduct();
            if (product.getQuantity() < item.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for: " + product.getName() + 
                        " (Requested: " + item.getQuantity() + ", Available: " + product.getQuantity() + ")");
            }
            subtotal += product.getPrice() * item.getQuantity();

            // Decrement product inventory
            product.setQuantity(product.getQuantity() - item.getQuantity());
            if (product.getQuantity() == 0) {
                product.setStockStatus("OUT_OF_STOCK");
            }
            productRepository.save(product);
        }

        int discount = 0;
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCaseAndActiveTrue(couponCode);
            if (couponOpt.isPresent()) {
                Coupon coupon = couponOpt.get();
                if (subtotal >= coupon.getMinOrderAmount()) {
                    discount = (subtotal * coupon.getDiscountPercentage()) / 100;
                    if (discount > coupon.getMaxDiscountAmount()) {
                        discount = coupon.getMaxDiscountAmount();
                    }
                }
            }
        }

        int gst = (int) (subtotal * 0.18); // 18% GST
        int deliveryCharges = (subtotal > 50 || subtotal == 0) ? 0 : 5; // Free delivery for orders > $50, else $5
        int total = subtotal - discount + gst + deliveryCharges;

        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");
        order.setSubtotal(subtotal);
        order.setDiscount(discount);
        order.setGst(gst);
        order.setDeliveryCharges(deliveryCharges);
        order.setTotal(total);
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus("COD".equalsIgnoreCase(paymentMethod) ? "PENDING" : "COMPLETED");
        order.setShippingAddress(shippingAddress);

        for (CartProduct item : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(item.getProduct());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(item.getProduct().getPrice());
            order.getItems().add(orderItem);
        }

        orderRepository.save(order);

        // Clear the cart
        cartService.clearCart(cart);

        return order;
    }

    @Override
    public Optional<Coupon> validateCoupon(String code, int subtotal) {
        return couponRepository.findByCodeIgnoreCaseAndActiveTrue(code)
                .filter(coupon -> subtotal >= coupon.getMinOrderAmount());
    }
}
