import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';
import { ShoppingCart, Heart, Search, Filter, RefreshCw, Star } from 'lucide-react';

export default function Home() {
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const { user } = useUser();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const searchQuery = searchParams.get('search') || '';
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
    const [sort, setSort] = useState(searchParams.get('sort') || '');
    const [inStock, setInStock] = useState(false);
    const [wishlistIds, setWishlistIds] = useState(new Set());

    // Synchronize component states when query parameters change (e.g. searching from Navbar)
    useEffect(() => {
        const cat = searchParams.get('category') || '';
        const brnd = searchParams.get('brand') || '';
        const srt = searchParams.get('sort') || '';
        setSelectedCategory(cat);
        setSelectedBrand(brnd);
        setSort(srt);
    }, [searchParams]);

    useEffect(() => {
        // Fetch static category and brand listings
        fetch('/api/products/categories').then(res => res.json()).then(data => setCategories(data)).catch(() => {});
        fetch('/api/products/brands').then(res => res.json()).then(data => setBrands(data)).catch(() => {});
    }, []);

    const fetchProducts = () => {
        setLoading(true);
        let url = `/api/products?q=${encodeURIComponent(searchQuery)}`;
        if (selectedCategory) url += `&categoryId=${selectedCategory}`;
        if (selectedBrand) url += `&brandId=${selectedBrand}`;
        if (sort) url += `&sort=${sort}`;
        if (inStock) url += `&inStock=true`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const fetchWishlist = () => {
        if (!user) return;
        fetch('/api/wishlist/check')
            .then(res => {
                if (res.ok) return res.json();
                return [];
            })
            .then(data => {
                // If it returns list of wishlisted products, store their IDs
                const ids = new Set(data.map(item => item.product.id));
                setWishlistIds(ids);
            })
            .catch(() => {});
    };

    useEffect(() => {
        fetchProducts();
    }, [searchQuery, selectedCategory, selectedBrand, sort, inStock]);

    useEffect(() => {
        fetchWishlist();
    }, [user]);

    const handleFilterChange = (type, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(type, value);
        } else {
            newParams.delete(type);
        }
        setSearchParams(newParams);
    };

    const handleReset = () => {
        setSearchParams({});
        setSelectedCategory('');
        setSelectedBrand('');
        setSort('');
        setInStock(false);
    };

    const handleWishlistToggle = async (productId) => {
        if (!user) {
            showToast('Please log in to add items to your wishlist', 'info');
            return;
        }
        const isWishlisted = wishlistIds.has(productId);
        const endpoint = isWishlisted ? '/api/wishlist/remove' : '/api/wishlist/add';
        
        try {
            const res = await fetch(`${endpoint}?productId=${productId}`, { method: 'POST' });
            if (res.ok) {
                const nextIds = new Set(wishlistIds);
                if (isWishlisted) {
                    nextIds.delete(productId);
                    showToast('Item removed from wishlist');
                } else {
                    nextIds.add(productId);
                    showToast('Item saved to wishlist');
                }
                setWishlistIds(nextIds);
            }
        } catch (err) {
            showToast('Failed to update wishlist', 'danger');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Sidebar Filter Panel */}
                <div className="w-full lg:w-64 flex-shrink-0 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm h-fit">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
                        <h5 className="font-bold text-gray-800 flex items-center gap-2">
                            <Filter size={18} />
                            Filters
                        </h5>
                        <button onClick={handleReset} className="text-xs text-blue-600 hover:text-blue-500 font-semibold flex items-center gap-1">
                            <RefreshCw size={12} />
                            Reset All
                        </button>
                    </div>

                    {/* Category List */}
                    <div className="mb-6">
                        <h6 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Category</h6>
                        <div className="space-y-2">
                            <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                                <input
                                    type="radio"
                                    name="category"
                                    checked={!selectedCategory}
                                    onChange={() => handleFilterChange('category', '')}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <span className="ml-2 font-medium">All Categories</span>
                            </label>
                            {categories.map(cat => (
                                <label key={cat.id} className="flex items-center text-sm text-gray-600 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="category"
                                        checked={Number(selectedCategory) === cat.id}
                                        onChange={() => handleFilterChange('category', cat.id)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 font-medium">{cat.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Brand List */}
                    <div className="mb-6">
                        <h6 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Brand</h6>
                        <select
                            value={selectedBrand}
                            onChange={(e) => handleFilterChange('brand', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Brands</option>
                            {brands.map(brand => (
                                <option key={brand.id} value={brand.id}>{brand.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Availability */}
                    <div className="mb-6">
                        <h6 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Availability</h6>
                        <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={inStock}
                                onChange={(e) => setInStock(e.target.checked)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <span className="ml-2 font-medium">In Stock Only</span>
                        </label>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    {/* Header bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-white p-4 border border-gray-100 rounded-2xl shadow-sm">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">
                                {searchQuery ? `Search Results for "${searchQuery}"` : 'Discover Premium Products'}
                            </h3>
                            <p className="text-xs text-gray-500">{products.length} items found</p>
                        </div>

                        {/* Sort Selector */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-400 uppercase">Sort By:</span>
                            <select
                                value={sort}
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Default</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="name_asc">Name: A-Z</option>
                            </select>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 6].map(n => (
                                <div key={n} className="bg-white border border-gray-100 p-4 rounded-2xl h-80 animate-pulse">
                                    <div className="bg-gray-200 rounded-xl w-full h-44 mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                                    <div className="h-8 bg-gray-200 rounded-full w-full"></div>
                                </div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl shadow-sm">
                            <Search className="mx-auto text-gray-300 mb-4" size={48} />
                            <h4 className="text-lg font-bold text-gray-700">No Products Found</h4>
                            <p className="text-sm text-gray-400 max-w-sm mx-auto mt-1">We couldn't find anything matching your query. Adjust your filters or explore our main catalog.</p>
                            <button onClick={handleReset} className="mt-4 bg-blue-600 text-white font-semibold rounded-full px-6 py-2 text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        /* Product Grid */
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
                            {products.map(prod => (
                                <div key={prod.id} className="group bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative">
                                    {/* Wishlist Heart */}
                                    <button
                                        onClick={() => handleWishlistToggle(prod.id)}
                                        className={`absolute top-4 right-4 p-2 rounded-full border border-gray-50 bg-white/80 backdrop-blur shadow-sm hover:scale-110 active:scale-95 transition-all z-10 ${wishlistIds.has(prod.id) ? 'text-red-500' : 'text-gray-400'}`}
                                    >
                                        <Heart size={16} fill={wishlistIds.has(prod.id) ? 'currentColor' : 'none'} />
                                    </button>

                                    <div>
                                        {/* Image */}
                                        <Link to={`/product/${prod.id}`} className="block relative bg-gray-50/50 rounded-xl overflow-hidden mb-4 p-4 h-48 flex items-center justify-center">
                                            <img
                                                src={prod.image}
                                                alt={prod.name}
                                                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-all duration-500"
                                            />
                                        </Link>

                                        {/* Product Details */}
                                        <div className="px-1">
                                            <div className="text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                {prod.category?.name || 'Category'}
                                            </div>
                                            <h5 className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-all truncate">
                                                <Link to={`/product/${prod.id}`} className="hover:underline">
                                                    {prod.name}
                                                </Link>
                                            </h5>
                                            
                                            {/* Rating simulation */}
                                            <div className="flex items-center gap-1 mt-1 mb-2">
                                                <div className="flex text-amber-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={12} fill="currentColor" />
                                                    ))}
                                                </div>
                                                <span className="text-xxs text-gray-400 font-semibold">(4.9)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pricing and Action */}
                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                                        <div>
                                            <span className="text-xxs text-gray-400 font-bold uppercase block">Price</span>
                                            <span className="text-base font-extrabold text-blue-600">${prod.price.toFixed(2)}</span>
                                        </div>

                                        {prod.quantity <= 0 ? (
                                            <span className="text-xxs font-bold text-red-500 bg-red-50 border border-red-100 rounded-full px-2.5 py-1">Out of Stock</span>
                                        ) : (
                                            <button
                                                onClick={async () => {
                                                    const res = await addToCart(prod.id, 1);
                                                    if (res && res.success) {
                                                        showToast('Added to Cart!');
                                                    } else if (res) {
                                                        showToast(res.message, 'info');
                                                    }
                                                }}
                                                className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                                            >
                                                <ShoppingCart size={14} />
                                                Add
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
