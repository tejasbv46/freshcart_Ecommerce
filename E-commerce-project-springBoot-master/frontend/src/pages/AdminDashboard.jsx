import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { LayoutDashboard, ShoppingBag, FolderKanban, Users, ShieldAlert, Award, Plus, Trash2, Edit } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
    const { user } = useUser();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [activeSection, setActiveSection] = useState('overview');

    // Metrics & lists data
    const [metrics, setMetrics] = useState(null);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form states (Add/Edit Category)
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);

    // Form states (Add/Edit Brand)
    const [newBrandName, setNewBrandName] = useState('');

    // Form states (Add/Edit Product)
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [pName, setPName] = useState('');
    const [pCategoryId, setPCategoryId] = useState('');
    const [pBrandId, setPBrandId] = useState('');
    const [pPrice, setPPrice] = useState('');
    const [pWeight, setPWeight] = useState('');
    const [pQuantity, setPQuantity] = useState('');
    const [pDescription, setPDescription] = useState('');
    const [pProductImage, setPProductImage] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'ROLE_ADMIN') {
            showToast('Access denied. Administrator privileges required.', 'danger');
            navigate('/');
            return;
        }
        fetchData();
    }, [user]);

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            fetch('/api/admin/metrics').then(res => res.json()),
            fetch('/api/products/categories').then(res => res.json()),
            fetch('/api/products/brands').then(res => res.json()),
            fetch('/api/products').then(res => res.json())
        ]).then(([metricsData, categoriesData, brandsData, productsData]) => {
            setMetrics(metricsData);
            setCategories(categoriesData);
            setBrands(brandsData);
            setProducts(productsData);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    // Category CRUD
    const handleAddCategory = async (e) => {
        e.preventDefault();
        const params = new URLSearchParams({ categoryname: newCategoryName });
        const res = await fetch(`/api/admin/categories/add?${params.toString()}`, { method: 'POST' });
        if (res.ok) {
            showToast('Category created!');
            setNewCategoryName('');
            fetchData();
        }
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        const params = new URLSearchParams({
            categoryid: editingCategory.id,
            categoryname: editingCategory.name
        });
        const res = await fetch(`/api/admin/categories/update?${params.toString()}`, { method: 'POST' });
        if (res.ok) {
            showToast('Category updated!');
            setEditingCategory(null);
            fetchData();
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        const res = await fetch(`/api/admin/categories/delete/${id}`, { method: 'POST' });
        if (res.ok) {
            showToast('Category deleted');
            fetchData();
        } else {
            const err = await res.text();
            showToast(err || 'Failed to delete category (referenced by products)', 'danger');
        }
    };

    // Brand CRUD
    const handleAddBrand = async (e) => {
        e.preventDefault();
        const params = new URLSearchParams({ name: newBrandName });
        const res = await fetch(`/api/admin/brands/add?${params.toString()}`, { method: 'POST' });
        if (res.ok) {
            showToast('Brand created!');
            setNewBrandName('');
            fetchData();
        }
    };

    // Product CRUD
    const handleOpenEditProduct = (prod) => {
        setEditingProduct(prod);
        setPName(prod.name);
        setPCategoryId(prod.category?.id || '');
        setPBrandId(prod.brand?.id || '');
        setPPrice(prod.price);
        setPWeight(prod.weight);
        setPQuantity(prod.quantity);
        setPDescription(prod.description);
        setPProductImage(prod.image);
        setShowProductForm(true);
    };

    const handleOpenAddProduct = () => {
        setEditingProduct(null);
        setPName('');
        setPCategoryId(categories[0]?.id || '');
        setPBrandId(brands[0]?.id || '');
        setPPrice('');
        setPWeight('');
        setPQuantity('');
        setPDescription('');
        setPProductImage('');
        setShowProductForm(true);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        const params = new URLSearchParams({
            name: pName,
            categoryid: pCategoryId,
            brandId: pBrandId,
            price: pPrice,
            weight: pWeight,
            quantity: pQuantity,
            description: pDescription,
            productImage: pProductImage
        });

        const endpoint = editingProduct
            ? `/api/admin/products/update/${editingProduct.id}`
            : '/api/admin/products/add';

        const res = await fetch(`${endpoint}?${params.toString()}`, { method: 'POST' });
        if (res.ok) {
            showToast(editingProduct ? 'Product details updated!' : 'Product added successfully!');
            setShowProductForm(false);
            fetchData();
        } else {
            showToast('Failed to save product details.', 'danger');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        const res = await fetch(`/api/admin/products/delete/${id}`, { method: 'POST' });
        if (res.ok) {
            showToast('Product deleted');
            fetchData();
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-8 mx-auto"></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    {[1, 2, 3].map(n => <div key={n} className="h-32 bg-gray-100 rounded-3xl"></div>)}
                </div>
            </div>
        );
    }

    // Mock sales charts data
    const chartData = [
        { name: 'Mon', Sales: 2400 },
        { name: 'Tue', Sales: 1398 },
        { name: 'Wed', Sales: 9800 },
        { name: 'Thu', Sales: 3908 },
        { name: 'Fri', Sales: 4800 },
        { name: 'Sat', Sales: 3800 },
        { name: 'Sun', Sales: 4300 },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Admin Nav Column */}
                <div className="w-full lg:w-64 flex-shrink-0 bg-white border border-gray-100 p-6 rounded-3xl shadow-sm h-fit">
                    <h5 className="font-extrabold text-gray-800 text-sm mb-6 flex items-center gap-1.5">
                        <LayoutDashboard size={18} className="text-blue-600" />
                        Admin Dashboard
                    </h5>
                    <div className="flex flex-col gap-2">
                        {[
                            { id: 'overview', label: 'Overview Metrics', icon: <LayoutDashboard size={16} /> },
                            { id: 'products', label: 'Manage Products', icon: <ShoppingBag size={16} /> },
                            { id: 'categories', label: 'Categories Menu', icon: <FolderKanban size={16} /> },
                            { id: 'brands', label: 'Brands Registry', icon: <Award size={16} /> },
                            { id: 'customers', label: 'Customer Base', icon: <Users size={16} /> },
                        ].map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${activeSection === section.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                {section.icon}
                                {section.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 space-y-6">

                    {/* SECTION: Overview */}
                    {activeSection === 'overview' && metrics && (
                        <div className="space-y-6">
                            {/* Cards Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex items-center justify-between">
                                    <div>
                                        <span className="text-xxs text-gray-400 font-bold uppercase tracking-wider block mb-1">Total Revenue</span>
                                        <span className="text-2xl font-black text-blue-600">${metrics.totalRevenue.toFixed(2)}</span>
                                    </div>
                                    <div className="bg-blue-50 text-blue-600 rounded-2xl p-3"><LayoutDashboard size={24} /></div>
                                </div>
                                <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex items-center justify-between">
                                    <div>
                                        <span className="text-xxs text-gray-400 font-bold uppercase tracking-wider block mb-1">Orders Placed</span>
                                        <span className="text-2xl font-black text-gray-800">{metrics.totalOrdersCount}</span>
                                    </div>
                                    <div className="bg-amber-50 text-amber-600 rounded-2xl p-3"><ShoppingBag size={24} /></div>
                                </div>
                                <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex items-center justify-between">
                                    <div>
                                        <span className="text-xxs text-gray-400 font-bold uppercase tracking-wider block mb-1">Total Users</span>
                                        <span className="text-2xl font-black text-gray-800">{metrics.totalUsersCount}</span>
                                    </div>
                                    <div className="bg-emerald-50 text-emerald-600 rounded-2xl p-3"><Users size={24} /></div>
                                </div>
                            </div>

                            {/* Chart & Alerts */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Sales Chart */}
                                <div className="lg:col-span-2 bg-white border border-gray-100 p-6 rounded-3xl shadow-sm h-80 flex flex-col justify-between">
                                    <h6 className="font-extrabold text-gray-800 text-sm mb-4">Weekly Sales Performance</h6>
                                    <div className="w-full h-56">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                                                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                                                <Tooltip />
                                                <Bar dataKey="Sales" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Low Stock Alert Panel */}
                                <div className="lg:col-span-1 bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-80">
                                    <div>
                                        <h6 className="font-extrabold text-red-500 text-sm flex items-center gap-1.5 mb-4">
                                            <ShieldAlert size={18} />
                                            Low Stock Alerts
                                        </h6>
                                        <div className="space-y-3 overflow-y-auto max-h-48 pr-2">
                                            {metrics.lowStockProducts.map(p => (
                                                <div key={p.id} className="flex justify-between items-center text-xs pb-2 border-b border-gray-50 last:border-0 last:pb-0">
                                                    <span className="text-gray-700 truncate max-w-[140px] font-semibold">{p.name}</span>
                                                    <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold text-xxs">Qty: {p.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiveSection('products')}
                                        className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-500 mt-2"
                                    >
                                        Manage Inventory
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECTION: Products */}
                    {activeSection === 'products' && (
                        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <h4 className="font-extrabold text-gray-900 text-base">Product Inventory</h4>
                                <button
                                    onClick={handleOpenAddProduct}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-100"
                                >
                                    <Plus size={14} />
                                    Add Product
                                </button>
                            </div>

                            {/* Product Form Modal (inside tab) */}
                            {showProductForm && (
                                <form onSubmit={handleSaveProduct} className="p-6 bg-gray-50 border border-gray-100 rounded-2xl space-y-4">
                                    <h5 className="font-extrabold text-gray-800 text-sm">
                                        {editingProduct ? `Edit Product Details: ${editingProduct.name}` : 'Create New Product'}
                                    </h5>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xxs font-semibold text-gray-500 uppercase mb-1">Product Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={pName}
                                                onChange={(e) => setPName(e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xxs font-semibold text-gray-500 uppercase mb-1">Category</label>
                                            <select
                                                value={pCategoryId}
                                                onChange={(e) => setPCategoryId(e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xxs font-semibold text-gray-500 uppercase mb-1">Brand</label>
                                            <select
                                                value={pBrandId}
                                                onChange={(e) => setPBrandId(e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-xxs font-semibold text-gray-500 uppercase mb-1">Price ($)</label>
                                            <input
                                                type="number"
                                                required
                                                value={pPrice}
                                                onChange={(e) => setPPrice(e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xxs font-semibold text-gray-500 uppercase mb-1">Weight (g)</label>
                                            <input
                                                type="number"
                                                required
                                                value={pWeight}
                                                onChange={(e) => setPWeight(e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xxs font-semibold text-gray-500 uppercase mb-1">Quantity Stock</label>
                                            <input
                                                type="number"
                                                required
                                                value={pQuantity}
                                                onChange={(e) => setPQuantity(e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xxs font-semibold text-gray-500 uppercase mb-1">Product Image URL</label>
                                            <input
                                                type="text"
                                                required
                                                value={pProductImage}
                                                onChange={(e) => setPProductImage(e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xxs font-semibold text-gray-500 uppercase mb-1">Product Description</label>
                                        <textarea
                                            rows="3"
                                            required
                                            value={pDescription}
                                            onChange={(e) => setPDescription(e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="flex gap-2 justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setShowProductForm(false)}
                                            className="px-4 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold"
                                        >
                                            Save Product
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Products table list */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase">
                                            <th className="pb-3">Name</th>
                                            <th className="pb-3">Category</th>
                                            <th className="pb-3">Price</th>
                                            <th className="pb-3">Stock Qty</th>
                                            <th className="pb-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {products.map(p => (
                                            <tr key={p.id} className="hover:bg-gray-50/50">
                                                <td className="py-3 font-semibold text-gray-800">{p.name}</td>
                                                <td className="py-3 text-gray-500">{p.category?.name}</td>
                                                <td className="py-3 font-bold text-blue-600">${p.price.toFixed(2)}</td>
                                                <td className="py-3 text-gray-600">{p.quantity}</td>
                                                <td className="py-3 text-right flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenEditProduct(p)}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(p.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* SECTION: Categories */}
                    {activeSection === 'categories' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Categories list table */}
                            <div className="lg:col-span-2 bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
                                <h4 className="font-extrabold text-gray-900 text-sm">Categories Catalog</h4>
                                <div className="divide-y divide-gray-100">
                                    {categories.map(c => (
                                        <div key={c.id} className="flex justify-between items-center py-3">
                                            <span className="text-xs font-semibold text-gray-800">{c.name}</span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setEditingCategory(c)}
                                                    className="p-1 text-gray-400 hover:text-blue-500 hover:bg-gray-50 rounded"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(c.id)}
                                                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Add / Edit Form Column */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* Add Form */}
                                <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
                                    <h5 className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                                        <Plus size={14} className="text-blue-500" />
                                        Add Category
                                    </h5>
                                    <form onSubmit={handleAddCategory} className="space-y-3">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter category name"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="submit"
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs"
                                        >
                                            Create Category
                                        </button>
                                    </form>
                                </div>

                                {/* Edit Form */}
                                {editingCategory && (
                                    <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h5 className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                                                <Edit size={14} className="text-blue-500" />
                                                Edit Category
                                            </h5>
                                            <button onClick={() => setEditingCategory(null)} className="text-xs text-gray-400">Cancel</button>
                                        </div>
                                        <form onSubmit={handleUpdateCategory} className="space-y-3">
                                            <input
                                                type="text"
                                                required
                                                value={editingCategory.name}
                                                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                type="submit"
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs"
                                            >
                                                Save Changes
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SECTION: Brands */}
                    {activeSection === 'brands' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Brands registry table */}
                            <div className="lg:col-span-2 bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
                                <h4 className="font-extrabold text-gray-900 text-sm">Brands Registry</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {brands.map(brand => (
                                        <div key={brand.id} className="border border-gray-50 p-3 rounded-xl flex items-center justify-between text-xs font-semibold text-gray-700">
                                            <span>{brand.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Add brand card */}
                            <div className="lg:col-span-1 bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
                                <h5 className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                                    <Plus size={14} className="text-blue-500" />
                                    Add Brand
                                </h5>
                                <form onSubmit={handleAddBrand} className="space-y-3">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter brand name"
                                        value={newBrandName}
                                        onChange={(e) => setNewBrandName(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs"
                                    >
                                        Create Brand
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* SECTION: Customers */}
                    {activeSection === 'customers' && (
                        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
                            <h4 className="font-extrabold text-gray-900 text-base">Customer Base</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase">
                                            <th className="pb-3">Username</th>
                                            <th className="pb-3">Email Address</th>
                                            <th className="pb-3">Default Address</th>
                                            <th className="pb-3 text-right">Role</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {customers.map(c => (
                                            <tr key={c.id} className="hover:bg-gray-50/50">
                                                <td className="py-3 font-semibold text-gray-800">{c.username}</td>
                                                <td className="py-3 text-gray-500">{c.email}</td>
                                                <td className="py-3 text-gray-600 truncate max-w-[200px]">{c.address}</td>
                                                <td className="py-3 text-right font-bold uppercase">{c.role}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
