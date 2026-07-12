import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Heart, User as UserIcon, Search, LogOut, LayoutDashboard, Settings } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useUser();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    useEffect(() => {
        // Fetch categories dynamically for navigation menu
        fetch('/api/products/categories')
            .then(res => {
                if (res.ok) return res.json();
                return [];
            })
            .then(data => setCategories(data))
            .catch(() => {});
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                                FreshCart
                            </span>
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-md mx-8 hidden md:block">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search premium items, brands..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            />
                            <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-blue-500">
                                <Search size={18} />
                            </button>
                        </form>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {/* Wishlist */}
                        <Link to="/profile?tab=wishlist" className="p-2 text-gray-600 hover:text-red-500 hover:bg-gray-50 rounded-full transition-all relative">
                            <Heart size={20} />
                        </Link>

                        {/* Cart */}
                        <Link to="/cart" className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-full transition-all relative">
                            <ShoppingCart size={20} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xxs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User Profile / Login */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-50 transition-all border border-gray-100"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 hidden sm:block pr-2">
                                        {user.username}
                                    </span>
                                </button>

                                {showUserDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="px-4 py-2 border-b border-gray-50">
                                            <p className="text-xs text-gray-400">Signed in as</p>
                                            <p className="text-sm font-semibold text-gray-800 truncate">{user.username}</p>
                                        </div>

                                        {user.role === 'ROLE_ADMIN' && (
                                            <Link
                                                to="/admin"
                                                onClick={() => setShowUserDropdown(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <LayoutDashboard size={16} />
                                                Admin Panel
                                            </Link>
                                        )}

                                        <Link
                                            to="/profile"
                                            onClick={() => setShowUserDropdown(false)}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <Settings size={16} />
                                            My Profile
                                        </Link>

                                        <button
                                            onClick={() => {
                                                logout();
                                                setShowUserDropdown(false);
                                                navigate('/login');
                                            }}
                                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                                        >
                                            <LogOut size={16} />
                                            Log Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm shadow-blue-100"
                            >
                                Log In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
