import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';
import { ShoppingCart, Heart, Star, ShieldCheck, Truck, RefreshCw, Send } from 'lucide-react';

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const { user } = useUser();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState('');
    const [wishlisted, setWishlisted] = useState(false);
    
    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        setLoading(true);
        fetch(`/api/products/${id}`)
            .then(res => {
                if (res.ok) return res.json();
                throw new Error('Not found');
            })
            .then(data => {
                setProduct(data);
                setSelectedImage(data.image);
                setLoading(false);
            })
            .catch(() => {
                showToast('Product not found.', 'danger');
                navigate('/');
            });
    }, [id]);

    useEffect(() => {
        if (!user || !product) return;
        
        // Check if wishlisted
        fetch('/api/wishlist/check')
            .then(res => res.json())
            .then(data => {
                const isSaved = data.some(item => item.product.id === product.id);
                setWishlisted(isSaved);
            })
            .catch(() => {});
        
        // Fetch reviews
        fetch(`/api/reviews/product/${id}`)
            .then(res => {
                if (res.ok) return res.json();
                return [];
            })
            .then(data => setReviews(data))
            .catch(() => {});
    }, [user, product]);

    const handleWishlistToggle = async () => {
        if (!user) {
            showToast('Please log in to manage your wishlist', 'info');
            return;
        }
        const endpoint = wishlisted ? '/api/wishlist/remove' : '/api/wishlist/add';
        try {
            const res = await fetch(`${endpoint}?productId=${product.id}`, { method: 'POST' });
            if (res.ok) {
                setWishlisted(!wishlisted);
                showToast(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
            }
        } catch (err) {
            showToast('Wishlist operation failed', 'danger');
        }
    };

    const handleAddReview = async (e) => {
        e.preventDefault();
        if (!user) {
            showToast('Please log in to submit a review', 'info');
            return;
        }
        if (!newComment.trim()) return;

        try {
            const res = await fetch(`/api/reviews/product/${product.id}/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating: newRating, comment: newComment })
            });

            if (res.ok) {
                const addedReview = await res.json();
                setReviews([addedReview, ...reviews]);
                setNewComment('');
                showToast('Review submitted successfully!');
            } else {
                showToast('Failed to submit review', 'danger');
            }
        } catch (err) {
            showToast('Network error', 'danger');
        }
    };

    const handleBuyNow = async () => {
        const res = await addToCart(product.id, quantity);
        if (res && res.success) {
            navigate('/cart');
        } else if (res) {
            showToast(res.message, 'info');
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-100 rounded-3xl h-96"></div>
                    <div className="space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-24 bg-gray-100 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Generate mock images for thumbnail slider
    const images = [
        product.image,
        product.image,
        product.image,
    ];

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : '4.9';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumbs */}
            <div className="text-xs text-gray-400 font-semibold mb-6">
                <span className="hover:underline cursor-pointer" onClick={() => navigate('/')}>Home</span>
                <span className="mx-2">/</span>
                <span>{product.category?.name || 'Category'}</span>
                <span className="mx-2">/</span>
                <span className="text-gray-600">{product.name}</span>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    
                    {/* Left: Product Images */}
                    <div>
                        <div className="bg-gray-50/50 rounded-2xl p-8 flex items-center justify-center h-96 border border-gray-100">
                            <img src={selectedImage} alt={product.name} className="max-h-full max-w-full object-contain" />
                        </div>
                        
                        {/* Thumbnails */}
                        <div className="flex gap-4 mt-4 justify-center">
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(img)}
                                    className={`w-16 h-16 p-2 bg-gray-50 border rounded-xl flex items-center justify-center transition-all ${selectedImage === img ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <img src={img} alt="Angle View" className="max-h-full max-w-full object-contain" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Info Panels */}
                    <div className="flex flex-col justify-between">
                        <div>
                            {/* Brand & Category info */}
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-blue-50 text-blue-600 text-xxs font-bold uppercase px-2.5 py-1 rounded-full">
                                    {product.category?.name || 'Category'}
                                </span>
                                <span className="text-xs font-semibold text-gray-400">
                                    Brand: <span className="text-gray-700 font-bold">{product.brand?.name || 'FreshCart'}</span>
                                </span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                                {product.name}
                            </h1>

                            {/* Ratings & reviews counts */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                                    <Star className="text-amber-400" size={16} fill="currentColor" />
                                    {averageRating}
                                </div>
                                <span className="h-4 w-px bg-gray-200"></span>
                                <span className="text-xs text-blue-600 hover:underline cursor-pointer font-medium">
                                    {reviews.length} Customer Reviews
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-600 leading-relaxed mb-6">
                                {product.description || 'Experience premium quality with our carefully curated FreshCart product line. Made from sustainable and top-grade materials, designed to offer long-lasting utility and high performance.'}
                            </p>

                            {/* Value metrics */}
                            <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-gray-50">
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                    <ShieldCheck size={18} className="text-emerald-500 flex-shrink-0" />
                                    100% Genuine
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                    <Truck size={18} className="text-blue-500 flex-shrink-0" />
                                    Free Delivery
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                    <RefreshCw size={18} className="text-indigo-500 flex-shrink-0" />
                                    7 Day Returns
                                </div>
                            </div>
                        </div>

                        {/* Buy / Cart actions */}
                        <div className="space-y-4">
                            <div className="flex items-end justify-between">
                                <div>
                                    <span className="text-xs text-gray-400 font-bold uppercase block">Special Price</span>
                                    <span className="text-3xl font-black text-blue-600">${product.price.toFixed(2)}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-400 font-bold block">Availability</span>
                                    {product.quantity > 0 ? (
                                        <span className="text-xs font-bold text-emerald-600">{product.quantity} units in stock</span>
                                    ) : (
                                        <span className="text-xs font-bold text-red-500">Out of Stock</span>
                                    )}
                                </div>
                            </div>

                            {product.quantity > 0 && (
                                <div className="flex gap-4 items-center">
                                    {/* Quantity Select */}
                                    <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-3 py-1 font-bold text-gray-600 hover:text-gray-800"
                                        >
                                            -
                                        </button>
                                        <span className="px-3 text-sm font-semibold text-gray-800">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                                            className="px-3 py-1 font-bold text-gray-600 hover:text-gray-800"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Add to Cart */}
                                    <button
                                        onClick={async () => {
                                            const res = await addToCart(product.id, quantity);
                                            if (res && res.success) {
                                                showToast('Added to Cart!');
                                            } else if (res) {
                                                showToast(res.message, 'info');
                                            }
                                        }}
                                        className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-blue-100"
                                    >
                                        <ShoppingCart size={18} />
                                        Add to Cart
                                    </button>

                                    {/* Wishlist toggle */}
                                    <button
                                        onClick={handleWishlistToggle}
                                        className={`p-3 rounded-xl border transition-all ${wishlisted ? 'border-red-100 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:text-red-500'}`}
                                    >
                                        <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
                                    </button>
                                </div>
                            )}

                            {product.quantity > 0 && (
                                <button
                                    onClick={handleBuyNow}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-100 transition-all text-center"
                                >
                                    Buy It Now
                                </button>
                            )}
                        </div>

                    </div>
                </div>

                {/* Reviews & Feedback Tab Section */}
                <div className="mt-16 border-t border-gray-100 pt-10">
                    <h3 className="text-xl font-extrabold text-gray-900 mb-6">Customer Reviews & Discussion</h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Review Submission Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl">
                                <h5 className="font-bold text-gray-800 mb-4">Write a Product Review</h5>
                                <form onSubmit={handleAddReview} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Rating</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setNewRating(star)}
                                                    className="focus:outline-none"
                                                >
                                                    <Star
                                                        size={22}
                                                        className={star <= newRating ? 'text-amber-400' : 'text-gray-300'}
                                                        fill={star <= newRating ? 'currentColor' : 'none'}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Comment</label>
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            rows="4"
                                            required
                                            placeholder="What did you think of the design, sizing, shipping, or quality?"
                                            className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 text-white font-bold py-2 rounded-xl text-sm flex items-center justify-center gap-1.5 hover:bg-blue-700 transition-all"
                                    >
                                        <Send size={14} />
                                        Submit Review
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Reviews list */}
                        <div className="lg:col-span-2 space-y-6">
                            {reviews.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl">
                                    <Star className="mx-auto text-gray-300 mb-2" size={32} />
                                    <p className="text-sm font-semibold text-gray-600">No Reviews Yet</p>
                                    <p className="text-xs text-gray-400">Be the first to review this product!</p>
                                </div>
                            ) : (
                                reviews.map(rev => (
                                    <div key={rev.id} className="border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <span className="font-bold text-gray-800 text-sm block">
                                                    {rev.customer?.username || 'Verified Shopper'}
                                                </span>
                                                <div className="flex gap-0.5 text-amber-400 mt-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={12}
                                                            fill={i < rev.rating ? 'currentColor' : 'none'}
                                                            className={i < rev.rating ? 'text-amber-400' : 'text-gray-300'}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400">Verified Purchase</span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed italic">
                                            "{rev.comment}"
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
