import React, { createContext, useState, useEffect, useContext } from 'react';
import { useUser } from './UserContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const { user } = useUser();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCart = async () => {
        if (!user) {
            setCartItems([]);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/cart');
            if (res.ok) {
                const data = await res.json();
                setCartItems(data);
            } else {
                setCartItems([]);
            }
        } catch (err) {
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [user]);

    const addToCart = async (productId, quantity = 1) => {
        if (!user) return { success: false, message: 'Please log in to add items to cart' };
        try {
            const res = await fetch(`/api/cart/add?productId=${productId}&quantity=${quantity}`, {
                method: 'POST'
            });
            if (res.ok) {
                await fetchCart();
                return { success: true };
            }
            return { success: false, message: 'Failed to add item to cart' };
        } catch (err) {
            return { success: false, message: 'Network error' };
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (!user) return;
        try {
            const res = await fetch(`/api/cart/update?productId=${productId}&quantity=${quantity}`, {
                method: 'POST'
            });
            if (res.ok) {
                await fetchCart();
            }
        } catch (err) {
            console.error('Error updating quantity:', err);
        }
    };

    const removeFromCart = async (productId) => {
        if (!user) return;
        try {
            const res = await fetch(`/api/cart/remove?productId=${productId}`, {
                method: 'POST'
            });
            if (res.ok) {
                await fetchCart();
            }
        } catch (err) {
            console.error('Error removing from cart:', err);
        }
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            cartCount,
            cartTotal,
            loading,
            addToCart,
            updateQuantity,
            removeFromCart,
            refreshCart: fetchCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
