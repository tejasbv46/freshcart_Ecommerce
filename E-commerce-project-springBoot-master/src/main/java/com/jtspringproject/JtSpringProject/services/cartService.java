package com.jtspringproject.JtSpringProject.services;

import com.jtspringproject.JtSpringProject.models.Cart;
import com.jtspringproject.JtSpringProject.models.CartProduct;
import com.jtspringproject.JtSpringProject.models.Product;
import com.jtspringproject.JtSpringProject.models.User;
import java.util.List;

public interface CartService {
    Cart getOrCreateCart(User user);
    List<CartProduct> getCartItems(Cart cart);
    void addProductToCart(Cart cart, Product product, int quantity);
    void updateCartProductQuantity(Cart cart, Product product, int quantity);
    void removeProductFromCart(Cart cart, Product product);
    void clearCart(Cart cart);
}
