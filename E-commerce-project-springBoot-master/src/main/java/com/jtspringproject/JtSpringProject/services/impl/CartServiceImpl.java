package com.jtspringproject.JtSpringProject.services.impl;

import com.jtspringproject.JtSpringProject.models.Cart;
import com.jtspringproject.JtSpringProject.models.CartProduct;
import com.jtspringproject.JtSpringProject.models.CartProductId;
import com.jtspringproject.JtSpringProject.models.Product;
import com.jtspringproject.JtSpringProject.models.User;
import com.jtspringproject.JtSpringProject.repositories.CartProductRepository;
import com.jtspringproject.JtSpringProject.repositories.CartRepository;
import com.jtspringproject.JtSpringProject.services.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartProductRepository cartProductRepository;

    @Autowired
    public CartServiceImpl(CartRepository cartRepository, CartProductRepository cartProductRepository) {
        this.cartRepository = cartRepository;
        this.cartProductRepository = cartProductRepository;
    }

    @Override
    public Cart getOrCreateCart(User user) {
        return cartRepository.findByCustomerId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setCustomer(user);
                    return cartRepository.save(newCart);
                });
    }

    @Override
    public List<CartProduct> getCartItems(Cart cart) {
        return cartProductRepository.findByCartId(cart.getId());
    }

    @Override
    @Transactional
    public void addProductToCart(Cart cart, Product product, int quantity) {
        CartProductId id = new CartProductId(cart.getId(), product.getId());
        Optional<CartProduct> existingItem = cartProductRepository.findById(id);

        if (existingItem.isPresent()) {
            CartProduct item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            cartProductRepository.save(item);
        } else {
            CartProduct newItem = new CartProduct(cart, product, quantity);
            cartProductRepository.save(newItem);
        }
    }

    @Override
    @Transactional
    public void updateCartProductQuantity(Cart cart, Product product, int quantity) {
        CartProductId id = new CartProductId(cart.getId(), product.getId());
        Optional<CartProduct> existingItem = cartProductRepository.findById(id);

        if (existingItem.isPresent()) {
            if (quantity <= 0) {
                cartProductRepository.delete(existingItem.get());
            } else {
                CartProduct item = existingItem.get();
                item.setQuantity(quantity);
                cartProductRepository.save(item);
            }
        }
    }

    @Override
    @Transactional
    public void removeProductFromCart(Cart cart, Product product) {
        CartProductId id = new CartProductId(cart.getId(), product.getId());
        cartProductRepository.findById(id).ifPresent(cartProductRepository::delete);
    }

    @Override
    @Transactional
    public void clearCart(Cart cart) {
        cartProductRepository.deleteByCartId(cart.getId());
    }
}
