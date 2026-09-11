import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../Api";
import { useAuth } from "../context/useAuth";
import { ArrowLeft, Printer, Star, CheckCircle, ChefHat, Truck, Gift, XCircle } from "lucide-react";

const orderSteps = [
    { label: "Order Placed", statuses: ["pending", "confirmed", "preparing", "ready", "delivered"], icon: CheckCircle },
    { label: "Confirmed", statuses: ["confirmed", "preparing", "ready", "delivered"], icon: ChefHat },
    { label: "Preparing / Out for Delivery", statuses: ["preparing", "ready", "delivered"], icon: Truck },
    { label: "Delivered", statuses: ["delivered"], icon: Gift },
];

const Orderdetails = () => {
    const { orderId } = useParams();
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    
    const [order, setOrder] = useState(null);
    const [loadingOrder, setLoadingOrder] = useState(true);

    // প্রতিটি খাবারের রেটিং স্টেট
    const [itemRatings, setItemRatings] = useState({});
    const [submittedItems, setSubmittedItems] = useState({});
    const [submittingId, setSubmittingId] = useState(null);

    useEffect(() => {
        if (!loading && !user) {
            navigate("/login");
            return;
        }

        const fetchOrder = async () => {
            try {
                setLoadingOrder(true);
                const res = await API.get(`/orderDetails/${orderId}`);
                if (res.data.status === "success") {
                    setOrder(res.data.data);
                }
            } catch (err) {
                console.error("Error fetching order details:", err);
            } finally {
                setLoadingOrder(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [loading, user, navigate, orderId]);

    const handlePrint = () => {
        if (typeof window !== "undefined") {
            window.focus();
            window.print();
        }
    };

    // আসল ব্যাকএন্ডে রেটিং পাঠানো
    const handleRateItem = async (menuItemId, stars) => {
        try {
            setSubmittingId(menuItemId);
            const res = await API.post(`/menu/${menuItemId}/review`, { rating: stars });
            if (res.data.status === "success") {
                setSubmittedItems((prev) => ({ ...prev, [menuItemId]: true }));
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to submit rating");
        } finally {
            setSubmittingId(null);
        }
    };

    if (loading || loadingOrder) {
        return <div className="text-center py-20 font-semibold text-gray-500">Loading Order Details...</div>;
    }

    if (!order) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-600 font-semibold mb-4">Order not found or access denied.</p>
                <button
                    onClick={() => navigate("/orders")}
                    className="bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold"
                >
                    Back to My Orders
                </button>
            </div>
        );
    }

    const isDelivered = order.status === "delivered";
    const invoiceId = order.orderId || order.tran_id || order.transactionId ||
        (order._id ? `ORD-${order._id.slice(-6).toUpperCase()}` : "ORD-NEW");
    const customerPhone = order.deliveryDetails?.phone ||
        order.deliveryAddress?.phone ||
        order.phone ||
        order.phoneNumber ||
        order.user?.phone ||
        order.userId?.phone ||
        order.userId?.addresses?.[0]?.phone ||
        "N/A";

    return (
        <div className="min-h-[90vh] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-6">
                
                {/* নেভিগেশন ও প্রিন্ট */}
                <div className="flex justify-between items-center print:hidden">
                    <button
                        onClick={() => navigate("/orders")}
                        className="flex items-center gap-1.5 text-gray-600 hover:text-amber-600 font-semibold text-sm transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to My Orders</span>
                    </button>

                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-xs active:scale-95 transition cursor-pointer"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Print Invoice</span>
                    </button>
                </div>

                {/* আসল ইনভয়েস কার্ড */}
                <div className="printable-invoice bg-white rounded-2xl shadow-xs border border-gray-100 p-6 sm:p-8 print:border-none print:shadow-none print:p-0">
                    
                    {/* হেডার */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-6 mb-6 gap-4">
                        <div>
                            <span className="text-2xl font-black text-amber-600 tracking-tight">DineFlow</span>
                            <p className="text-xs text-gray-400 mt-0.5">Freshly prepared & delivered with care</p>
                        </div>

                        <div className="sm:text-right">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">INVOICE</span>
                            <span className="text-sm font-bold text-gray-800">{invoiceId}</span>
                            <span className="text-xs text-gray-400 block mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString()} at{" "}
                                {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                        </div>
                    </div>

                    {order.status === "cancelled" ? (
                        <div className="mb-6 flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                            <XCircle className="h-5 w-5" /> Order Cancelled
                        </div>
                    ) : (
                        <div className="mb-6 overflow-x-auto pb-1">
                            <div className="grid w-full grid-cols-4 items-start">
                                {orderSteps.map((step, index) => {
                                    const Icon = step.icon;
                                    const isComplete = step.statuses.includes(order.status);
                                    const isActive = order.status === step.statuses[step.statuses.length - 1] ||
                                        (index === 0 && order.status === "pending");

                                    return (
                                        <div key={step.label} className="relative flex flex-1 flex-col items-center text-center">
                                            {index < orderSteps.length - 1 && (
                                                <div className={`absolute left-1/2 top-5 h-0.5 w-full ${isComplete ? "bg-emerald-400" : "bg-gray-200"}`} />
                                            )}
                                            <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                                                isComplete ? "border-emerald-500 bg-emerald-500 text-white" :
                                                isActive ? "border-amber-500 bg-amber-50 text-amber-600" :
                                                "border-gray-200 bg-white text-gray-400"
                                            }`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <span className={`mt-2 max-w-[120px] text-[11px] font-bold ${isComplete ? "text-emerald-700" : "text-gray-500"}`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* তথ্য */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl mb-6 text-xs text-gray-600">
                        <div>
                            <p className="text-gray-400 font-medium">Delivery Address:</p>
                            <p className="font-semibold text-gray-800 mt-0.5">{order.deliveryAddress?.street || "N/A"}</p>
                            <p className="text-gray-600">{order.deliveryAddress?.city} {order.deliveryAddress?.postalCode}</p>
                            <p className="text-gray-800 font-semibold mt-1">Phone: {customerPhone}</p>
                        </div>

                        <div className="sm:text-right space-y-1">
                            <p>
                                <span className="text-gray-400">Payment: </span>
                                <span className="font-bold uppercase text-gray-800">{order.paymentMethod}</span>
                                <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                                    order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {order.paymentStatus}
                                </span>
                            </p>
                            <p>
                                <span className="text-gray-400">Order Status: </span>
                                <span className={`font-bold uppercase px-2 py-0.5 rounded-lg text-xs ${
                                    order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                    order.status === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-200' :
                                    'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                    {order.status}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* কুকিং নোট */}
                    {order.notes && (
                        <div className="mb-6 p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900">
                            <span className="font-bold">Special Note: </span>
                            <span>"{order.notes}"</span>
                        </div>
                    )}

                    {/* খাবার আইটেম তালিকা */}
                    <div className="border-b pb-6 mb-6">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Order Items</h3>
                        <div className="space-y-4">
                            {order.items?.map((item) => {
                                const itemId = item.menuItemId || item.id || item._id;
                                const userRating = itemRatings[itemId] || 5;
                                const isSubmitted = submittedItems[itemId];

                                return (
                                    <div key={itemId || `${item.itemName}-${item.price}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50/60 rounded-xl">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                                <span className="font-semibold text-gray-800 text-sm">{item.itemName}</span>
                                                <span className="text-xs text-gray-400">× {item.quantity}</span>
                                            </div>
                                            <p className="text-xs font-bold text-gray-700 mt-0.5">
                                                ৳{item.subtotal || item.price * item.quantity}
                                            </p>
                                        </div>

                                        {/* ⭐ ডেলিভারি হওয়ার পর প্রতিটি খাবারের জন্য লাইভ রেটিং দেওয়ার বাটন */}
                                        {isDelivered && (
                                            <div className="flex items-center gap-2 print:hidden">
                                                {isSubmitted ? (
                                                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Rated!
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-xs">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                onClick={() => setItemRatings({ ...itemRatings, [itemId]: star })}
                                                                className={`w-4 h-4 cursor-pointer transition ${
                                                                    userRating >= star ? "fill-amber-400 text-amber-400" : "text-gray-300"
                                                                }`}
                                                            />
                                                        ))}
                                                        <button
                                                            onClick={() => handleRateItem(itemId, userRating)}
                                                            disabled={submittingId === itemId}
                                                            className="ml-2 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold px-2 py-0.5 rounded transition"
                                                        >
                                                            {submittingId === itemId ? "..." : "Rate"}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* বিল সামারি */}
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between text-xs">
                            <span>Delivery Fee</span>
                            <span>৳{order.deliveryFee || 60}</span>
                        </div>
                        <div className="flex justify-between items-center text-base font-bold text-gray-900 pt-3 border-t">
                            <span>Grand Total:</span>
                            <span className="text-amber-600 text-lg">TK {order.totalAmount}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Orderdetails;