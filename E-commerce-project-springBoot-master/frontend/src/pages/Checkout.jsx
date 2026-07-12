import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';
import { Truck, CreditCard, Check, Plus, ShieldCheck, QrCode } from 'lucide-react';

export default function Checkout() {
    const { cartItems, cartTotal, refreshCart } = useCart();
    const { showToast } = useToast();
    const { user } = useUser();
    const navigate = useNavigate();

    // Shipping & billing
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [couponCode, setCouponCode] = useState(sessionStorage.getItem('appliedCoupon') || '');
    const [couponDiscount, setCouponDiscount] = useState(0);

    // New address form
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [country, setCountry] = useState('India');

    // Payment modals
    const [showUpiModal, setShowUpiModal] = useState(false);
    const [showCardModal, setShowCardModal] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Fetch addresses
        fetch('/api/profile/addresses')
            .then(res => res.json())
            .then(data => {
                setAddresses(data);
                if (data.length > 0) {
                    setSelectedAddressId(data[0].id);
                }
            })
            .catch(() => {});

        // Fetch coupon discount if applied
        if (couponCode) {
            fetch(`/api/coupon/validate?code=${encodeURIComponent(couponCode)}&subtotal=${cartTotal}`)
                .then(res => {
                    if (res.ok) return res.json();
                    return null;
                })
                .then(coupon => {
                    if (coupon) {
                        const discount = Math.min((cartTotal * coupon.discountPercentage) / 100, coupon.maxDiscountAmount);
                        setCouponDiscount(discount);
                    }
                })
                .catch(() => {});
        }
    }, [user]);

    const handleAddAddress = async (e) => {
        e.preventDefault();
        const params = new URLSearchParams({
            street, city, state, zipCode, country
        });
        try {
            const res = await fetch(`/api/profile/addresses/add?${params.toString()}`, {
                method: 'POST'
            });
            if (res.ok) {
                const newAddr = await res.json();
                setAddresses([...addresses, newAddr]);
                setSelectedAddressId(newAddr.id);
                setShowNewAddressForm(false);
                setStreet('');
                setCity('');
                setState('');
                setZipCode('');
                showToast('New address saved!');
            } else {
                showToast('Failed to save address', 'danger');
            }
        } catch (err) {
            showToast('Network error', 'danger');
        }
    };

    const handlePlaceOrder = async () => {
        let finalAddressStr = '';
        if (selectedAddressId) {
            const selected = addresses.find(a => a.id === selectedAddressId);
            finalAddressStr = `${selected.street}, ${selected.city}, ${selected.state} - ${selected.zipCode}, ${selected.country}`;
        } else if (user?.address) {
            finalAddressStr = user.address;
        } else {
            showToast('Please provide a delivery address', 'info');
            return;
        }

        const params = new URLSearchParams({
            shippingAddress: finalAddressStr,
            paymentMethod,
            couponCode: couponCode || ''
        });

        try {
            const res = await fetch(`/api/orders/place?${params.toString()}`, {
                method: 'POST'
            });
            if (res.ok) {
                showToast('Order placed successfully! Thank you for shopping with us.');
                sessionStorage.removeItem('appliedCoupon');
                await refreshCart();
                navigate('/profile?tab=orders');
            } else {
                const errMsg = await res.text();
                showToast(errMsg || 'Failed to place order', 'danger');
            }
        } catch (err) {
            showToast('Failed to place order due to network issue', 'danger');
        }
    };

    const triggerPaymentFlow = () => {
        if (paymentMethod === 'UPI') {
            setShowUpiModal(true);
        } else if (paymentMethod === 'CARD') {
            setShowCardModal(true);
        } else {
            handlePlaceOrder();
        }
    };

    // Calculate totals
    const gst = cartTotal * 0.18;
    const delivery = cartTotal > 50 ? 0 : 5.00;
    const totalPayable = cartTotal - couponDiscount + gst + delivery;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                <Truck className="text-blue-600" size={24} />
                Secure Checkout
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Columns: Address & Payment */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Shipping Address Selection */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-extrabold text-gray-800 text-sm flex items-center gap-1.5">
                                <Truck size={18} className="text-blue-500" />
                                Shipping Address
                            </h4>
                            <button
                                onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                                className="text-xs text-blue-600 hover:text-blue-500 font-bold flex items-center gap-1"
                            >
                                <Plus size={14} />
                                Add New Address
                            </button>
                        </div>

                        {/* Add address form */}
                        {showNewAddressForm && (
                            <form onSubmit={handleAddAddress} className="mb-6 p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-4">
                                <h6 className="font-bold text-gray-800 text-xs">Add New Address Entry</h6>
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
                                        <label className="block text-xxs font-semibold text-gray-500 uppercase mb-1">State / Province</label>
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
                                        onClick={() => setShowNewAddressForm(false)}
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

                        {/* Address book list */}
                        {addresses.length === 0 ? (
                            <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                                <p className="text-xs text-gray-500 mb-2">No saved address entries found. Using default account address:</p>
                                <p className="font-semibold text-xs text-gray-700">{user?.address || 'No address configured. Please add one.'}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {addresses.map(addr => (
                                    <div
                                        key={addr.id}
                                        onClick={() => setSelectedAddressId(addr.id)}
                                        className={`p-4 border rounded-2xl cursor-pointer transition-all relative flex flex-col justify-between ${selectedAddressId === addr.id ? 'border-blue-500 bg-blue-50/20' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                                    >
                                        {selectedAddressId === addr.id && (
                                            <span className="absolute top-3 right-3 bg-blue-600 text-white rounded-full p-0.5">
                                                <Check size={10} />
                                            </span>
                                        )}
                                        <div>
                                            <span className="text-xxs font-bold text-gray-400 uppercase tracking-wider block mb-2">Address Entry</span>
                                            <p className="text-xs font-semibold text-gray-700 leading-relaxed">
                                                {addr.street}, {addr.city}, {addr.state}
                                            </p>
                                            <p className="text-xxs text-gray-500 mt-1">{addr.zipCode}, {addr.country}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Payment Method Selector */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        <h4 className="font-extrabold text-gray-800 text-sm mb-4 flex items-center gap-1.5">
                            <CreditCard size={18} className="text-blue-500" />
                            Payment Method
                        </h4>

                        <div className="space-y-3">
                            {[
                                { id: 'COD', label: 'Cash on Delivery (COD)', desc: 'Pay with cash upon package receipt.' },
                                { id: 'UPI', label: 'UPI Instant Scan', desc: 'Scan and pay instantly using GooglePay, PhonePe, or BHIM.' },
                                { id: 'CARD', label: 'Stripe Credit/Debit Card', desc: 'Secure payment via Visa, Mastercard, or RuPay.' },
                            ].map(method => (
                                <label
                                    key={method.id}
                                    className={`flex items-start p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === method.id ? 'border-blue-500 bg-blue-50/20' : 'border-gray-100 hover:border-gray-200'}`}
                                >
                                    <input
                                        type="radio"
                                        name="payment"
                                        checked={paymentMethod === method.id}
                                        onChange={() => setPaymentMethod(method.id)}
                                        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                    <div className="ml-3">
                                        <span className="font-bold text-gray-800 text-sm block">{method.label}</span>
                                        <span className="text-xs text-gray-500 mt-0.5 block">{method.desc}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm sticky top-24">
                        <h4 className="font-extrabold text-gray-900 mb-4">Order Summary</h4>

                        {/* Brief items summary */}
                        <div className="max-h-48 overflow-y-auto mb-4 pb-4 border-b border-gray-50 space-y-3">
                            {cartItems.map(item => (
                                <div key={item.product.id} className="flex justify-between items-center text-xs">
                                    <span className="text-gray-600 truncate max-w-[200px]">
                                        {item.product.name} <span className="font-bold">x {item.quantity}</span>
                                    </span>
                                    <span className="font-semibold text-gray-800">${(item.product.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Pricing details */}
                        <div className="space-y-2 pb-4 border-b border-gray-100 text-xs">
                            <div className="flex justify-between text-gray-500">
                                <span>Items Subtotal</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            {couponDiscount > 0 && (
                                <div className="flex justify-between text-emerald-600">
                                    <span>Coupon Discount</span>
                                    <span>-${couponDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-500">
                                <span>GST (18%)</span>
                                <span>${gst.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Delivery Fee</span>
                                <span>{delivery === 0 ? 'Free' : `$${delivery.toFixed(2)}`}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center py-4 font-black text-gray-900 text-base mb-6">
                            <span>Total Due</span>
                            <span className="text-blue-600">${totalPayable.toFixed(2)}</span>
                        </div>

                        <button
                            onClick={triggerPaymentFlow}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-1.5 transition-all text-sm"
                        >
                            Place Secure Order
                        </button>
                    </div>
                </div>
            </div>

            {/* UPI QR Payment Modal Simulation */}
            {showUpiModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center relative border border-gray-100 shadow-2xl">
                        <h4 className="font-extrabold text-gray-900 mb-2">UPI Instant Payment</h4>
                        <p className="text-xs text-gray-500 mb-4">Scan using any GPay, PhonePe, BHIM, or Paytm app</p>
                        
                        {/* Mock QR image */}
                        <div className="bg-gray-100 rounded-2xl p-6 inline-block mb-4 border border-gray-200">
                            <QrCode size={180} className="text-gray-800 mx-auto" />
                        </div>

                        <div className="bg-blue-50 text-blue-800 text-sm font-black py-2 rounded-xl mb-6">
                            Payable Amount: ${totalPayable.toFixed(2)}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowUpiModal(false)}
                                className="flex-1 border border-gray-200 hover:bg-gray-50 py-2.5 rounded-xl text-xs font-semibold text-gray-600 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowUpiModal(false);
                                    handlePlaceOrder();
                                }}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-100"
                            >
                                Confirm Paid
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stripe Card Modal Simulation */}
            {showCardModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full relative border border-gray-100 shadow-2xl space-y-4">
                        <h4 className="font-extrabold text-gray-900 text-center">Stripe Secure Card Payment</h4>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xxs font-semibold text-gray-500 uppercase mb-1">Card Number</label>
                                <input
                                    type="text"
                                    placeholder="4111 2222 3333 4444"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xxs font-semibold text-gray-500 uppercase mb-1">Expiry Date</label>
                                    <input
                                        type="text"
                                        placeholder="MM / YY"
                                        value={cardExpiry}
                                        onChange={(e) => setCardExpiry(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xxs font-semibold text-gray-500 uppercase mb-1">CVV / Security Code</label>
                                    <input
                                        type="password"
                                        placeholder="•••"
                                        value={cardCvv}
                                        onChange={(e) => setCardCvv(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs">
                            <span className="font-medium text-gray-500">Transaction Value</span>
                            <span className="font-black text-gray-800">${totalPayable.toFixed(2)}</span>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowCardModal(false)}
                                className="flex-1 border border-gray-200 hover:bg-gray-50 py-2.5 rounded-xl text-xs font-semibold text-gray-600 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowCardModal(false);
                                    handlePlaceOrder();
                                }}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-100"
                            >
                                Pay Securely
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
