import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Api";
import { CalendarCheck, CircleDollarSign, ClipboardList, Clock3, Truck, Users } from "lucide-react";
import { useAuth } from "../context/useAuth";

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [bookings, setBookings] = useState([]);

    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const getOrderPhone = (order) => (
        order.deliveryAddress?.phone ||
        order.userId?.phone ||
        order.userId?.addresses?.[0]?.phone ||
        "No Phone"
    );

    // অ্যাডমিন কিনা এবং লগইন করা আছে কিনা যাচাই
    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate("/login");
            } else if (user.role !== "admin") {
                alert("Access Denied: Only Admins can view this page!");
                navigate("/");
            }
        }
    }, [user, loading, navigate]);

    // ব্যাকএন্ড থেকে সব অর্ডার নিয়ে আসা
    const fetchAllOrders = async () => {
        try {
            setLoadingOrders(true);
            const res = await API.get("/allOrders");
            if (res.data.status === "success") {
                const orderList = Array.isArray(res.data)
                    ? res.data
                    : (res.data.orders || res.data.data || []);
                setOrders(Array.isArray(orderList) ? orderList : []);
            }
        } catch (err) {
            console.error("Error fetching admin orders:", err);
        } finally {
            setLoadingOrders(false);
        }
    };

    useEffect(() => {
        if (user && user.role === "admin") {
            const fetchTimer = window.setTimeout(fetchAllOrders, 0);
            return () => window.clearTimeout(fetchTimer);
        }
    }, [user]);

    const fetchBookings = async () => {
        try {
            const res = await API.get("/tableBookings");
            if (res.data.status === "success") setBookings(res.data.data || []);
        } catch (error) {
            console.error("Error fetching table bookings:", error);
        }
    };

    useEffect(() => {
        if (user && user.role === "admin") {
            const bookingTimer = window.setTimeout(fetchBookings, 0);
            return () => window.clearTimeout(bookingTimer);
        }
        return undefined;
    }, [user]);

    // ১. অর্ডারের স্ট্যাটাস লাইভ পরিবর্তন (Pending -> Preparing -> Delivered)
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            setUpdatingId(orderId);
            const res = await API.put(`/updateOrder/${orderId}`, { status: newStatus });
            if (res.data.status === "success") {
                setOrders((prev) =>
                    prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
                );
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update order status");
        } finally {
            setUpdatingId(null);
        }
    };

    // ২. ক্যাশ অন ডেলিভারি (COD) পেমেন্ট গ্রহণ (Mark as Paid)
    const handleMarkAsPaid = async (orderId) => {
        if (!window.confirm("Are you sure you received the cash payment?")) return;
        try {
            setUpdatingId(orderId);
            const res = await API.put(`/order/${orderId}/mark-paid`);
            if (res.data.status === "success") {
                setOrders((prev) =>
                    prev.map((o) =>
                        o.orderId === orderId
                            ? { ...o, paymentStatus: "paid", status: "delivered" }
                            : o
                    )
                );
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to mark as paid");
        } finally {
            setUpdatingId(null);
        }
    };

    // ৩. অর্ডার ডিলিট করা
    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to permanently delete this order?")) return;
        try {
            setUpdatingId(orderId);
            const res = await API.delete(`/deleteOrder/${orderId}`);
            if (res.data.status === "success") {
                setOrders((prev) => prev.filter((o) => o.orderId !== orderId && o._id !== orderId));
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete order");
        } finally {
            setUpdatingId(null);
        }
    };

    // ফিল্টারিং এবং সার্চ লজিক
    const filteredOrders = orders.filter((order) => {
        const matchesStatus = filterStatus === "all" || order.status === filterStatus;
        const matchesSearch =
            (order.orderId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            getOrderPhone(order).toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const totalRevenue = orders.reduce((sum, order) => {
        const isCompleted = order.paymentStatus === "paid" || order.status === "delivered";
        return isCompleted ? sum + Number(order.totalAmount || 0) : sum;
    }, 0);
    const activeDeliveries = orders.filter((order) => ["pending", "confirmed"].includes(order.status)).length;
    const pendingBookings = bookings.filter((booking) => booking.status === "pending").length;
    const revenueByDay = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - (6 - index));
        const key = date.toISOString().slice(0, 10);
        const revenue = orders.reduce((sum, order) => {
            const orderDate = new Date(order.createdAt).toISOString().slice(0, 10);
            const isCompleted = order.paymentStatus === "paid" || order.status === "delivered";
            return orderDate === key && isCompleted ? sum + Number(order.totalAmount || 0) : sum;
        }, 0);
        return { key, label: date.toLocaleDateString([], { weekday: "short" }), revenue };
    });
    const chartMax = Math.max(...revenueByDay.map((day) => day.revenue), 1);
    const chartPoints = revenueByDay.map((day, index) => `${(index / 6) * 100},${92 - (day.revenue / chartMax) * 72}`).join(" ");

    const updateBookingStatus = async (bookingId, status) => {
        try {
            const res = await API.patch(`/tableBookings/${bookingId}`, { status });
            if (res.data.status === "success") {
                setBookings((current) => current.map((booking) => booking._id === bookingId ? res.data.data : booking));
            }
        } catch (error) {
            alert(error.response?.data?.message || "Unable to update table booking");
        }
    };

    if (loading || loadingOrders) {
        return <div className="text-center py-20 font-semibold text-gray-500">Loading Admin Dashboard...</div>;
    }

    return (
        <div className="min-h-[90vh] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* হেডার ও কাউন্টার */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Order Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage and track live customer food orders</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="bg-orange-100 text-orange-700 font-bold px-4 py-2 rounded-xl text-sm">
                            Total Orders: {orders.length}
                        </span>
                        <button
                            onClick={fetchAllOrders}
                            className="bg-white hover:bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-xl text-sm border shadow-sm transition"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                        <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Total Revenue</p><CircleDollarSign className="h-6 w-6 text-emerald-600" /></div>
                        <p className="mt-2 text-2xl font-black text-emerald-900">৳{totalRevenue.toLocaleString()}</p>
                        <p className="mt-1 text-xs text-emerald-700">Paid or completed orders</p>
                    </div>
                    <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
                        <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-orange-700">Total Orders</p><ClipboardList className="h-6 w-6 text-orange-600" /></div>
                        <p className="mt-2 text-2xl font-black text-orange-900">{orders.length.toLocaleString()}</p>
                        <p className="mt-1 text-xs text-orange-700">All placed orders</p>
                    </div>
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                        <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Active Deliveries</p><Truck className="h-6 w-6 text-blue-600" /></div>
                        <p className="mt-2 text-2xl font-black text-blue-900">{activeDeliveries.toLocaleString()}</p>
                        <p className="mt-1 text-xs text-blue-700">Pending or confirmed</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_0.9fr] mb-6">
                    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Revenue overview</p>
                                <h2 className="mt-1 text-xl font-black text-gray-900">Last 7 days</h2>
                            </div>
                            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">৳{revenueByDay.reduce((sum, day) => sum + day.revenue, 0).toLocaleString()}</span>
                        </div>
                        <div className="mt-4 h-48 w-full">
                            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-36 w-full overflow-visible" role="img" aria-label="Revenue area chart for the last seven days">
                                <defs><linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.35" /><stop offset="100%" stopColor="#10b981" stopOpacity="0.02" /></linearGradient></defs>
                                <line x1="0" y1="92" x2="100" y2="92" stroke="#e5e7eb" strokeWidth="0.6" />
                                <polygon points={`0,92 ${chartPoints} 100,92`} fill="url(#revenueFill)" />
                                <polyline points={chartPoints} fill="none" stroke="#059669" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                                {revenueByDay.map((day, index) => <circle key={day.key} cx={(index / 6) * 100} cy={92 - (day.revenue / chartMax) * 72} r="1.7" fill="#ffffff" stroke="#059669" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
                            </svg>
                            <div className="flex justify-between text-[11px] font-semibold text-gray-400">{revenueByDay.map((day) => <span key={day.key}>{day.label}</span>)}</div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div><p className="text-xs font-bold uppercase tracking-wider text-gray-400">Dine-in bookings</p><h2 className="mt-1 text-xl font-black text-gray-900">Table requests</h2></div>
                            <CalendarCheck className="h-6 w-6 text-orange-500" />
                        </div>
                        <div className="mt-4 flex items-center gap-3 rounded-xl bg-orange-50 p-3"><Users className="h-5 w-5 text-orange-600" /><span className="text-sm font-bold text-orange-900">{pendingBookings} awaiting confirmation</span></div>
                        <div className="mt-3 max-h-44 space-y-2 overflow-y-auto">
                            {bookings.length === 0 ? <p className="py-6 text-center text-sm text-gray-400">No table requests yet.</p> : bookings.slice(0, 5).map((booking) => (
                                <div key={booking._id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2.5">
                                    <div className="min-w-0"><p className="truncate text-sm font-bold text-gray-800">{booking.name} <span className="font-normal text-gray-400">({booking.guests})</span></p><p className="flex items-center gap-1 text-xs text-gray-400"><Clock3 className="h-3 w-3" /> {booking.date} at {booking.time}</p></div>
                                    <select value={booking.status} onChange={(event) => updateBookingStatus(booking._id, event.target.value)} className="rounded-lg border border-gray-200 px-2 py-1 text-[11px] font-bold uppercase text-gray-600"><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="seated">Seated</option><option value="cancelled">Cancelled</option></select>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* ফিল্টার এবং সার্চ বার */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                    {/* সার্চ বক্স */}
                    <input
                        type="text"
                        placeholder="Search by Order ID or Phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-80 px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />

                    {/* স্ট্যাটাস ফিল্টার বাটন */}
                    <div className="flex flex-wrap gap-2">
                        {["all", "pending", "confirmed", "preparing", "ready", "delivered", "cancelled"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                                    filterStatus === status
                                        ? "bg-orange-500 text-white shadow-sm"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* অর্ডার টেবিল / লিস্ট */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 text-gray-400">
                        No orders found matching your criteria.
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="py-4 px-6">Order ID & Date</th>
                                        <th className="py-4 px-6">Customer & Phone</th>
                                        <th className="py-4 px-6">Items Ordered</th>
                                        <th className="py-4 px-6">Bill & Payment</th>
                                        <th className="py-4 px-6">Current Status</th>
                                        <th className="py-4 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {filteredOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50/60 transition">
                                            {/* Order ID & Date */}
                                            <td className="py-4 px-6">
                                                <span className="font-bold text-gray-800 block">{order.orderId || order._id}</span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(order.createdAt).toLocaleDateString()} at{" "}
                                                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </td>

                                            {/* Customer & Phone */}
                                            <td className="py-4 px-6">
                                                <p className="font-semibold text-gray-700">{getOrderPhone(order)}</p>
                                                <p className="text-xs text-gray-400 max-w-xs truncate">
                                                    {order.deliveryAddress?.street || "Address N/A"}
                                                </p>
                                            </td>

                                            {/* Items */}
                                            <td className="py-4 px-6">
                                                <div className="space-y-1">
                                                    {order.items?.map((item) => (
                                                        <div key={item.menuItemId || `${item.itemName}-${item.price}`} className="text-xs text-gray-600">
                                                            • <span className="font-semibold">{item.itemName}</span> × {item.quantity}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>

                                            {/* Bill & Payment */}
                                            <td className="py-4 px-6">
                                                <span className="font-bold text-gray-900 block">TK {order.totalAmount}</span>
                                                <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full inline-block mt-1 bg-gray-100 text-gray-600">
                                                    {order.paymentMethod}
                                                </span>
                                                <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full inline-block ml-1 mt-1 ${
                                                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                                                }`}>
                                                    {order.paymentStatus}
                                                </span>
                                            </td>

                                            {/* Status Dropdown */}
                                            <td className="py-4 px-6">
                                                <select
                                                    value={order.status}
                                                    disabled={updatingId === order.orderId}
                                                    onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                                                    className={`text-xs font-bold uppercase rounded-lg px-3 py-1.5 border focus:outline-none transition cursor-pointer ${
                                                        order.status === "delivered" ? "bg-green-50 text-green-700 border-green-200" :
                                                        order.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                        order.status === "cancelled" ? "bg-red-50 text-red-600 border-red-200" :
                                                        "bg-blue-50 text-blue-700 border-blue-200"
                                                    }`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="preparing">Preparing</option>
                                                    <option value="ready">Ready</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>

                                           {/* Actions */}
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* COD Mark as Paid Button */}
                                                {order.paymentStatus !== "paid" && (
                                                    <button
                                                        onClick={() => handleMarkAsPaid(order.orderId)}
                                                        disabled={updatingId === order.orderId}
                                                        className="whitespace-nowrap text-xs bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium px-3 py-1.5 rounded-lg shadow-sm transition-all duration-150"
                                                        title="Mark order as paid and delivered"
                                                    >
                                                        Mark Paid
                                                    </button>
                                                )}

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDeleteOrder(order.orderId || order._id)}
                                                    disabled={updatingId === order.orderId}
                                                    className="whitespace-nowrap text-xs bg-red-50 hover:bg-red-500 hover:text-white text-red-600 font-medium px-3 py-1.5 rounded-lg border border-red-200 active:scale-95 transition-all duration-150"
                                                    title="Delete order"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;