import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { User, Trash2, Shield, Truck, Heart, MapPin, Receipt, ChevronDown, ChevronUp, Download } from 'lucide-react';

export default function Profile() {
    const { user, refreshUser } = useUser();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'account');
    
    // Tab dynamic data states
    const [orders, setOrders] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    // Profile updates form
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [address, setAddress] = useState(user?.address || '');

    // Add address form
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [country, setCountry] = useState('India');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        setUsername(user.username);
        setEmail(user.email);
        setAddress(user.address);
    }, [user]);

    const fetchOrders = () => {
        fetch('/api/orders')
            .then(res => res.json())
            .then(data => setOrders(data))
            .catch(() => {});
    };

    const fetchWishlist = () => {
        fetch('/api/wishlist/check')
            .then(res => res.json())
            .then(data => setWishlist(data))
            .catch(() => {});
    };

    const fetchAddresses = () => {
        fetch('/api/profile/addresses')
            .then(res => res.json())
            .then(data => setAddresses(data))
            .catch(() => {});
    };

    useEffect(() => {
        const tab = searchParams.get('tab') || 'account';
        setActiveTab(tab);

        if (tab === 'orders') fetchOrders();
        if (tab === 'wishlist') fetchWishlist();
        if (tab === 'addresses') fetchAddresses();
    }, [searchParams]);

    const handleTabChange = (tabName) => {
        setSearchParams({ tab: tabName });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const params = new URLSearchParams({
            username, email, address, password
        });

        try {
            const res = await fetch(`/api/profile/update?${params.toString()}`, { method: 'POST' });
            if (res.ok) {
                await refreshUser();
                setPassword('');
                showToast('Account details saved successfully!');
            } else {
                showToast('Failed to save profile changes.', 'danger');
            }
        } catch (err) {
            showToast('Network error', 'danger');
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        const params = new URLSearchParams({
            street, city, state, zipCode, country
        });
        try {
            const res = await fetch(`/api/profile/addresses/add?${params.toString()}`, { method: 'POST' });
            if (res.ok) {
                const newAddr = await res.json();
                setAddresses([...addresses, newAddr]);
                setShowAddressForm(false);
                setStreet('');
                setCity('');
                setState('');
                setZipCode('');
                showToast('Address added!');
            }
        } catch (err) {
            showToast('Failed to add address', 'danger');
        }
    };

    const handleDeleteAddress = async (addrId) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            const res = await fetch(`/api/profile/addresses/delete/${addrId}`, { method: 'POST' });
            if (res.ok) {
                setAddresses(addresses.filter(a => a.id !== addrId));
                showToast('Address entry deleted');
            }
        } catch (err) {
            showToast('Deletion failed', 'danger');
        }
    };

    const handleDeleteWishlistItem = async (productId) => {
        try {
            const res = await fetch(`/api/wishlist/remove?productId=${productId}`, { method: 'POST' });
            if (res.ok) {
                setWishlist(wishlist.filter(item => item.product.id !== productId));
                showToast('Wishlist item removed');
            }
        } catch (err) {
            showToast('Operation failed', 'danger');
        }
    };

    const handleDownloadInvoice = (order) => {
        showToast(`Generating invoice for order #FC-${order.id}...`);
        
        // Simulate invoice generation
        const text = `===========================================
FRESHCART E-COMMERCE INVOICE
===========================================
Order Reference: #FC-${order.id}
Date: ${new Date(order.orderDate).toLocaleDateString()}
Billing Status: PAID
Customer Name: ${user.username}
Shipping Address: ${order.shippingAddress}

Items Summary:
-------------------------------------------
${order.items.map(item => `${item.product.name} x ${item.quantity}  -  $${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Financials:
-------------------------------------------
Total Paid: $${order.total.toFixed(2)}

Thank you for shopping with FreshCart E-Commerce!
===========================================`;

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Invoice_FC-${order.id}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Left: Avatar & Nav Card */}
                <div className="lg:col-span-1 bg-white border border-gray-100 p-6 rounded-3xl shadow-sm text-center h-fit">
                    <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-extrabold text-2xl mx-auto mb-4 shadow-md shadow-indigo-100">
                        {user?.username.charAt(0).toUpperCase()}
                    </div>
                    <h5 className="font-extrabold text-gray-800 text-base">{user?.username}</h5>
                    <p className="text-xs text-gray-400 mb-6 truncate">{user?.email}</p>

                    {/* Navigation tabs */}
                    <div className="flex flex-col gap-2 text-left">
                        {[
                            { id: 'account', label: 'Account settings', icon: <User size={16} /> },
                            { id: 'orders', label: 'My Orders', icon: <Receipt size={16} /> },
                            { id: 'wishlist', label: 'Saved Wishlist', icon: <Heart size={16} /> },
                            { id: 'addresses', label: 'Address Book', icon: <MapPin size={16} /> },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Tab Contents */}
                <div className="lg:col-span-3">
                    
                    {/* Tab: Account details */}
                    {activeTab === 'account' && (
                        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                            <h4 className="font-extrabold text-gray-900 text-lg mb-6 flex items-center gap-2">
                                <Shield className="text-blue-600" size={20} />
                                Account Settings
                            </h4>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Username</label>
                                        <input
                                            type="text"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">New Password (leave blank to keep current)</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Default Address</label>
                                    <textarea
                                        rows="3"
                                        required
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-blue-100"
                                >
                                    Save Changes
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Tab: Orders */}
                    {activeTab === 'orders' && (
                        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                            <h4 className="font-extrabold text-gray-900 text-lg mb-6 flex items-center gap-2">
                                <Receipt className="text-blue-600" size={20} />
                                Order History
                            </h4>

                            {orders.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl">
                                    <Truck className="mx-auto text-gray-300 mb-2" size={32} />
                                    <p className="text-sm font-semibold text-gray-600">No Orders Yet</p>
                                    <p className="text-xs text-gray-400">You haven't placed any orders on FreshCart yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map(ord => (
                                        <div key={ord.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                            {/* Header summary */}
                                            <div
                                                onClick={() => setExpandedOrderId(expandedOrderId === ord.id ? null : ord.id)}
                                                className="bg-gray-50/50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 cursor-pointer select-none hover:bg-gray-50 transition-all border-b border-gray-100"
                                            >
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full text-xs">
                                                    <div>
                                                        <span className="text-gray-400 block font-bold uppercase mb-0.5">Order ID</span>
                                                        <span className="font-extrabold text-gray-800">#FC-{ord.id}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400 block font-bold uppercase mb-0.5">Date</span>
                                                        <span className="font-semibold text-gray-700">{new Date(ord.orderDate).toLocaleDateString()}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400 block font-bold uppercase mb-0.5">Total Paid</span>
                                                        <span className="font-extrabold text-blue-600">${ord.total.toFixed(2)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400 block font-bold uppercase mb-0.5">Status</span>
                                                        <span className={`inline-block font-extrabold rounded-full px-2.5 py-0.5 text-xxs ${ord.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                                            {ord.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0 text-gray-400 pl-4">
                                                    {expandedOrderId === ord.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </div>
                                            </div>

                                            {/* Expanded details */}
                                            {expandedOrderId === ord.id && (
                                                <div className="p-4 bg-white border-t border-gray-50 space-y-4">
                                                    <h6 className="font-bold text-gray-800 text-xs">Products Ordered</h6>
                                                    <div className="space-y-2">
                                                        {ord.items.map(item => (
                                                            <div key={item.id} className="flex justify-between items-center text-xs text-gray-600">
                                                                <span>{item.product.name} <span className="font-bold">x {item.quantity}</span></span>
                                                                <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="border-t border-gray-50 pt-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                                        <div className="text-xxs text-gray-500">
                                                            <p><strong>Shipping:</strong> {ord.shippingAddress}</p>
                                                            <p className="mt-0.5"><strong>Payment:</strong> {ord.paymentMethod.toUpperCase()}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDownloadInvoice(ord)}
                                                            className="text-xxs font-bold text-blue-600 hover:text-blue-500 border border-blue-100 rounded-lg px-3 py-1.5 flex items-center gap-1.5 self-end sm:self-auto bg-blue-50/20"
                                                        >
                                                            <Download size={12} />
                                                            Download Invoice
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Wishlist */}
                    {activeTab === 'wishlist' && (
                        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                            <h4 className="font-extrabold text-gray-900 text-lg mb-6 flex items-center gap-2">
                                <Heart className="text-blue-600" size={20} />
                                Saved Wishlist
                            </h4>

                            {wishlist.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl">
                                    <Heart className="mx-auto text-gray-300 mb-2" size={32} />
                                    <p className="text-sm font-semibold text-gray-600">Wishlist is Empty</p>
                                    <p className="text-xs text-gray-400">Save products to your wishlist for later purchase.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {wishlist.map(w => (
                                        <div key={w.product.id} className="border border-gray-100 rounded-2xl p-4 flex gap-4 items-center bg-white justify-between shadow-sm">
                                            <div className="flex gap-3 items-center min-w-0">
                                                <img src={w.product.image} className="w-12 h-12 object-contain" alt={w.product.name} />
                                                <div className="min-w-0">
                                                    <h6 className="font-bold text-gray-800 text-xs truncate">{w.product.name}</h6>
                                                    <span className="text-xxs font-bold text-blue-600 mt-0.5 block">${w.product.price.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteWishlistItem(w.product.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Addresses */}
                    {activeTab === 'addresses' && (
                        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="font-extrabold text-gray-900 text-lg flex items-center gap-2 mb-0">
                                    <MapPin className="text-blue-600" size={20} />
                                    Address Book
                                </h4>
                                <button
                                    onClick={() => setShowAddressForm(!showAddressForm)}
                                    className="text-xs text-blue-600 hover:text-blue-500 font-bold border border-blue-100 px-3 py-1.5 rounded-lg bg-blue-50/20"
                                >
                                    Add New Address
                                </button>
                            </div>

                            {/* Add address subform */}
                            {showAddressForm && (
                                <form onSubmit={handleAddAddress} className="mb-6 p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-4">
                                    <h6 className="font-bold text-gray-800 text-xs">Add New Address Record</h6>
                                    <div>
                                        <label className="block text-xxs font-semibold text-gray-500 uppercase mb-1">Street Address</label>
                                        <input
                                            type="text"
                                            required
                                            value={street}
                                            onChange={(e) => setStreet(e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xxs font-semibold text-gray-500 uppercase mb-1">City</label>
                                            <input
                                                type="text"
                                                required
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xxs font-semibold text-gray-500 uppercase mb-1">State</label>
                                            <input
                                                type="text"
                                                required
                                                value={state}
                                                onChange={(e) => setState(e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xxs font-semibold text-gray-500 uppercase mb-1">Zip Code</label>
                                            <input
                                                type="text"
                                                required
                                                value={zipCode}
                                                onChange={(e) => setZipCode(e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xxs font-semibold text-gray-500 uppercase mb-1">Country</label>
                                            <input
                                                type="text"
                                                required
                                                value={country}
                                                onChange={(e) => setCountry(e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddressForm(false)}
                                            className="px-4 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold"
                                        >
                                            Save Address
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Addresses List */}
                            {addresses.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl">
                                    <MapPin className="mx-auto text-gray-300 mb-2" size={32} />
                                    <p className="text-sm font-semibold text-gray-600">No Saved Addresses</p>
                                    <p className="text-xs text-gray-400">Save delivery locations for quicker checkout.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {addresses.map(addr => (
                                        <div key={addr.id} className="border border-gray-100 rounded-2xl p-4 flex justify-between items-center bg-white shadow-sm hover:border-gray-200 transition-all">
                                            <div>
                                                <span className="bg-gray-100 text-gray-500 text-xxs font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-2 inline-block">Address Entry</span>
                                                <p className="text-xs font-semibold text-gray-800">
                                                    {addr.street}, {addr.city}, {addr.state}
                                                </p>
                                                <p className="text-xxs text-gray-500 mt-0.5">{addr.zipCode}, {addr.country}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteAddress(addr.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
