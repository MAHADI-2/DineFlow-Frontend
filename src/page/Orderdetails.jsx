import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../Api";
import { useAuth } from "../context/useAuth";
import toast from "react-hot-toast";
import { ArrowLeft, Printer, Star, CheckCircle, ChefHat, Truck, Gift, XCircle } from "lucide-react";

const orderSteps = [
    { label: "Order Placed", statuses: ["pending", "confirmed", "preparing", "ready", "delivered"], icon: CheckCircle },
    { label: "Confirmed", statuses: ["confirmed", "preparing", "ready", "delivered"], icon: ChefHat },
    { label: "Preparing / Out for Delivery", statuses: ["preparing", "ready", "delivered"], icon: Truck },
    { label: "Delivered", statuses: ["delivered"], icon: Gift },
];

const getFoodId = (item) => (
    item?.menuItem?._id ||
    item?.menuItem?.id ||
    (typeof item?.menuItem === "string" ? item.menuItem : null) ||
    item?.menuItemId ||
    item?._id ||
    item?.id
);

const Orderdetails = () => {
    const { orderId } = useParams();
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    
    const [order, setOrder] = useState(null);
    const [loadingOrder, setLoadingOrder] = useState(true);

    const [reviewItem, setReviewItem] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [serviceExperience, setServiceExperience] = useState([]);
    const [reviewComment, setReviewComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

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

    const openReviewModal = (item) => {
        setReviewItem(item);
        setReviewRating(5);
        setHoverRating(0);
        setServiceExperience([]);
        setReviewComment("");
    };

    const closeReviewModal = () => {
        if (!submittingReview) setReviewItem(null);
    };

    const toggleExperience = (experience) => {
        setServiceExperience((current) => current.includes(experience)
            ? current.filter((item) => item !== experience)
            : [...current, experience]
        );
    };

    const handleReviewSubmit = async (event) => {
        event.preventDefault();
        const foodId = getFoodId(reviewItem);
        if (!foodId || !reviewItem) {
            toast.error("This food item could not be identified. Please refresh the order and try again.");
            return;
        }

        try {
            setSubmittingReview(true);
            const res = await API.post("/reviews/create", {
                orderId: order.orderId,
                menuItemId: foodId,
                rating: reviewRating,
                serviceExperience,
                comment: reviewComment
            });
            if (res.data.success === true || res.data.status === "success") {
                setOrder((currentOrder) => ({
                    ...currentOrder,
                    items: currentOrder.items.map((item) => (
                        String(getFoodId(item)) === String(foodId)
                            ? { ...item, isReviewed: true }
                            : item
                    ))
                }));
                setReviewItem(null);
                toast.success("🎉 Thank you for your feedback! It helps us serve you better.");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Unable to submit your review. Please try again.");
        } finally {
            setSubmittingReview(false);
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
                        <div className="flex items-center gap-3">
                            <img src="/dineflow-logo.svg" alt="DineFlow Logo" className="h-10 w-10 object-cover rounded-xl shadow-sm print:shadow-none" />
                            <div><span className="text-2xl font-black text-amber-600 tracking-tight">DineFlow</span>
                            <p className="text-xs text-gray-400 mt-0.5">Freshly prepared & delivered with care</p>
                            </div>
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
                                                <span className={`mt-2 max-w-30 text-[11px] font-bold ${isComplete ? "text-emerald-700" : "text-gray-500"}`}>
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
                                const itemId = getFoodId(item);
                                const isSubmitted = item.isReviewed;

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
                                                    <button
                                                        type="button"
                                                        onClick={() => openReviewModal(item)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-700"
                                                    >
                                                        <Star className="h-3.5 w-3.5" /> Rate
                                                    </button>
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

            {reviewItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 px-4 py-6 print:hidden" role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
                    <form onSubmit={handleReviewSubmit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Your feedback matters</p>
                                <h2 id="review-modal-title" className="mt-1 text-2xl font-black text-gray-900">Rate Food &amp; Service</h2>
                                <p className="mt-1 text-sm text-gray-500">How was <span className="font-semibold text-gray-700">{reviewItem.itemName}</span>?</p>
                            </div>
                            <button type="button" onClick={closeReviewModal} className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700" aria-label="Close review modal">
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-sm font-semibold text-gray-700">Overall rating</p>
                            <div className="mt-2 flex justify-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onFocus={() => setHoverRating(star)}
                                        onClick={() => setReviewRating(star)}
                                        className="rounded-full p-1 transition hover:scale-110"
                                        aria-label={`${star} star${star > 1 ? "s" : ""}`}
                                    >
                                        <Star className={`h-8 w-8 ${star <= (hoverRating || reviewRating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-5">
                            <p className="text-sm font-semibold text-gray-700">What stood out?</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {["Fast Delivery", "Piping Hot", "Polite Rider", "Great Packaging"].map((experience) => (
                                    <button
                                        key={experience}
                                        type="button"
                                        onClick={() => toggleExperience(experience)}
                                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${serviceExperience.includes(experience) ? "border-amber-500 bg-amber-100 text-amber-800" : "border-gray-200 bg-white text-gray-600 hover:border-amber-300"}`}
                                    >
                                        {experience === "Fast Delivery" ? "⚡" : experience === "Piping Hot" ? "🍲" : experience === "Polite Rider" ? "😊" : "👌"} {experience}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <label className="mt-5 block text-sm font-semibold text-gray-700" htmlFor="review-comment">Review comment</label>
                        <textarea
                            id="review-comment"
                            value={reviewComment}
                            onChange={(event) => setReviewComment(event.target.value)}
                            maxLength={1000}
                            rows={4}
                            placeholder="How was the taste and service? Share your honest feedback with our chef..."
                            className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
                        />

                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={closeReviewModal} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50" disabled={submittingReview}>Cancel</button>
                            <button type="submit" className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={submittingReview}>
                                {submittingReview ? "Submitting..." : "Submit Review"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Orderdetails;