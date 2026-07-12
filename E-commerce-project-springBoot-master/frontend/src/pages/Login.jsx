import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, ShoppingBag, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const { login } = useUser();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const res = await login(username, password);
        setSubmitting(false);

        if (res.success) {
            showToast('Welcome back to FreshCart!');
            navigate('/');
        } else {
            showToast(res.message, 'danger');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <ShoppingBag size={24} />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Log in to manage your orders, wishlist, and cart.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                                Username
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <Mail size={16} />
                                </span>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <Lock size={16} />
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-semibold text-blue-600 hover:text-blue-500">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
