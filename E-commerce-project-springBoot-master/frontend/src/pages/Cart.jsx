import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';
import { Trash2, Heart, ShoppingBag, ArrowRight, Bookmark } from 'lucide-react';

export default function Cart() {
    const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();
    const { showToast } = useToast();
    const { user } = useUser();
    const navigate = useNavigate();

    // Coupon states
    const [couponCode, setCouponCode] = useState(sessionStorage.getItem('appliedCoupon') || '');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponSuccessMsg, setCouponSuccessMsg] = useState('');
    
    // Save for Later / Wishlist
    const [savedItems, setSavedItems] = useState([]);

    const fetchSavedItems = () => {
        if (!user) return;
        fetch('/api/wishlist/check')
            .then(res => {
                if (res.ok) return res.json();
                return [];
            })
            .then(data => setSavedItems(data))
            .catch(() => {});
    };

    useEffect(() => {
        fetchSavedItems();
    }, [user]);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        try {
            const res = await fetch(`/api/coupon/validate?code=${encodeURIComponent(couponCode)}&subtotal=${cartTotal}`);
            if (res.ok) {
                const coupon = await res.json();
                const discount = Math.min((cartTotal * coupon.discountPercentage) / 100, coupon.maxDiscountAmount);
                setCouponDiscount(discount);
                setCouponSuccessMsg(`Coupon applied! Saved $${discount.toFixed(2)}`);
                sessionStorage.setItem('appliedCoupon', coupon.code);
                showToast('Coupon code applied successfully!');
            } else {
                setCouponDiscount(0);
                setCouponSuccessMsg('');
                showToast('Invalid coupon or minimum spend not met.', 'danger');
            }
        } catch (err) {
            showToast('Failed to validate coupon', 'danger');
        }
    };

    const handleSaveForLater = async (productId) => {
        try {
            // Add to wishlist
            const wRes = await fetch(`/api/wishlist/add?productId=${productId}`, { method: 'POST' });
            if (wRes.ok) {
                // Delete from cart
                await removeFromCart(productId);
                await fetchSavedItems();
                showToast('Item saved for later!');
            }
        } catch (err) {
            showToast('Operation failed', 'danger');
        }
    };

    const handleMoveToCart = async (productId) => {
        try {
            // Remove from wishlist
            const wRes = await fetch(`/api/wishlist/remove?productId=${productId}`, { method: 'POST' });
            if (wRes.ok) {
                // Add to cart
                const cRes = await fetch(`/api/cart/add?productId=${productId}&quantity=1`, { method: 'POST' });
                if (cRes.ok) {
                    await fetchSavedItems();
                    // Reload cart context items
                    window.location.reload();
                    showToast('Item moved to cart!');
                }
            }
        } catch (err) {
            showToast('Operation failed', 'danger');
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) return;
        navigate('/checkout');
    };

    // Calculate billing
    const gstRate = 0.18; // 18% GST
    const gst = cartTotal * gstRate;
    const deliveryCharges = cartTotal > 50 ? 0 : 5.00;
    const finalTotal = cartTotal - couponDiscount + gst + deliveryCharges;

    if (cartItems.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                    <ShoppingBag className="mx-auto text-gray-300 mb-4 animate-bounce" size={54} />
                    <h2 className="text-xl font-extrabold text-gray-800">Your Shopping Cart is Empty</h2>
                    <p className="text-sm text-gray-400 max-w-sm mx-auto mt-2 mb-6">Explore our premium selection and add items to your cart to begin checking out.</p>
                    <Link to="/" className="bg-blue-600 text-white font-semibold rounded-full px-6 py-2.5 text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
                        Go Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                <ShoppingBag className="text-blue-600" size={24} />
                Shopping Cart
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Cart items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
                        {cartItems.map(item => (
                            <div key={item.product.id} className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                                {/* Image */}
                                <Link to={`/product/${item.product.id}`} className="w-20 h-20 bg-gray-50 rounded-xl p-2 flex items-center justify-center border border-gray-100 flex-shrink-0">
                                    <img src={item.product.image} alt={item.product.name} className="max-h-full max-w-full object-contain" />
                                </Link>

                                {/* Info */}
                                <div className="flex-grow min-w-0 text-center sm:text-left">
                                    <h5 className="font-bold text-gray-800 text-sm truncate">
                                        <Link to={`/product/${item.product.id}`} className="hover:text-blue-600 hover:underline">
                                            {item.product.name}
                                        </Link>
                                    </h5>
                                    <span className="text-xs text-gray-400 font-bold uppercase block mt-0.5">Price: ${item.product.price.toFixed(2)}</span>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-4">
                                    {/* Quantity editor */}
                                    <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-0.5">
                                        <button
                                            onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                                            className="px-2.5 py-0.5 text-sm font-semibold text-gray-600"
                                        >
                                            -
                                        </button>
                                        <span className="px-3 text-xs font-bold text-gray-800">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.product.id, Math.min(item.product.stock, item.quantity + 1))}
                                            className="px-2.5 py-0.5 text-sm font-semibold text-gray-600"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Action Buttons */}
                                    <button
                                        onClick={() => handleSaveForLater(item.product.id)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                                        title="Save for Later"
                                    >
                                        <Bookmark size={16} />
                                    </button>

                                    <button
                                        onClick={() => removeFromCart(item.product.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Save for later / Wishlist block */}
                    {savedItems.length > 0 && (
                        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                            <h4 className="font-extrabold text-gray-800 text-sm mb-4 flex items-center gap-1.5">
                                <Heart size={16} className="text-red-500" fill="currentColor" />
                                Saved for Later ({savedItems.length})
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {savedItems.map(w => (
                                    <div key={w.product.id} className="border border-gray-100 rounded-2xl p-4 flex gap-4 items-center">
                                        <img src={w.product.image} className="w-12 h-12 object-contain" alt={w.product.name} />
                                        <div className="flex-grow min-w-0">
                                            <h6 className="font-bold text-gray-800 text-xs truncate">{w.product.name}</h6>
                                            <span className="text-xxs font-bold text-blue-600 mt-0.5 block">${w.product.price.toFixed(2)}</span>
                                        </div>
                                        <button
                                            onClick={() => handleMoveToCart(w.product.id)}
                                            className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-xxs font-bold transition-all"
                                        >
                                            Move to Cart
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Checkout Pricing Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm sticky top-24">
                        <h4 className="font-extrabold text-gray-900 mb-4">Price Details</h4>
                        
                        <div className="space-y-3 pb-4 border-b border-gray-100 text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>Cart Subtotal</span>
                                <span className="font-semibold text-gray-800">${cartTotal.toFixed(2)}</span>
                            </div>
                            
                            {couponDiscount > 0 && (
                                <div className="flex justify-between text-emerald-600 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                                    <span>Coupon Discount</span>
                                    <span className="font-semibold">-${couponDiscount.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-gray-500">
                                <span>GST (18%)</span>
                                <span className="font-semibold text-gray-800">${gst.toFixed(2)}</span>
                            </div>
                            
                            <div className="flex justify-between text-gray-500">
                                <span>Delivery Fee</span>
                                <span className="font-semibold text-gray-800">
                                    {deliveryCharges === 0 ? <span className="text-emerald-600">Free</span> : `$${deliveryCharges.toFixed(2)}`}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center py-4 text-gray-900 font-extrabold text-lg">
                            <span>Total Payable</span>
                            <span className="text-blue-600">${finalTotal.toFixed(2)}</span>
                        </div>

                        {/* Coupon validation box */}
                        <div className="mb-6 space-y-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter Coupon (e.g. DISCOUNT_20)"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    className="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                                >
                                    Apply
                                </button>
                            </div>
                            {couponSuccessMsg && (
                                <div className="text-emerald-600 text-xs font-semibold">{couponSuccessMsg}</div>
                            )}
                        </div>

                        <button
                            onClick={handleCheckout}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center gap-1.5 transition-all text-sm"
                        >
                            Proceed to Checkout
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
