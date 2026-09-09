import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import API from "../Api";

const Order = () => {
    const [orders, setOrders] = useState([]);
    const [cancellingId, setCancellingId] = useState(null);
    const [error, setError] = useState("");
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    
   useEffect(() => {
    // ১. যদি লোডিং শেষ হয় এবং ইউজার লগইন না থাকে, সাথে সাথে লগইন পেজে পাঠাও
    if (!loading && !user) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await API.get("/orders");
        if (res.data.status === "success") {
          setOrders(res.data.data || []);
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Could not load your orders. Please try again.");
      }
    };

    fetchOrders();
  }, [loading, user, navigate]);

  const handleCancelOrder = async (order) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      setCancellingId(order._id);
      const res = await API.delete(`/cancelOrder/${order._id}`);
      if (res.data.status === "success") {
        setOrders((prev) =>
          prev.map((o) => (o._id === order._id ? { ...o, status: "cancelled" } : o))
        );
      } else {
        alert(res.data.message || "Could not cancel this order");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Something went wrong while cancelling");
    } finally {
      setCancellingId(null);
    }
  };

    return (
        <div className="min-h-[85vh] bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 tracking-wide">My Orders</h1>
                    <span className="text-sm bg-orange-100 text-orange-600 font-semibold px-3 py-1 rounded-full">
                        Total Orders: {orders.length}
                    </span>
                </div>

                {error ? (
                  <div className="bg-red-50 text-red-600 rounded-2xl p-8 text-center">{error}</div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <p className="text-gray-500 text-lg font-medium">No orders found yet!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div 
                                key={order._id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                            >
                                <div className="space-y-1.5">
                                    <div className="flex items-center space-x-3">
                                        <h2 className="text-sm font-bold text-gray-900">
                                            Order ID: <span className="text-gray-600 font-normal">{order._id}</span>
                                        </h2>
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
                                            order.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                                            order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {order.status || "Pending"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium">
                                        Date: {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                                    </p>
                                    <p className="text-base font-bold text-orange-600 pt-1">
                                        TK {order.totalAmount}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    {order.status === "pending" && (
                                        <button
                                            onClick={() => handleCancelOrder(order)}
                                            disabled={cancellingId === order._id}
                                            className="flex-1 sm:flex-none bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 border border-red-200 active:scale-95 disabled:opacity-60"
                                        >
                                            {cancellingId === order._id ? "Cancelling..." : "Cancel"}
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => navigate (`/orderdetails/${order.orderId || order._id}`)}
                                        className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm shadow-orange-500/20 active:scale-95"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Order;