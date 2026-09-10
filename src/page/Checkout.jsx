import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart";
import { useAuth } from "../context/useAuth";
import API from "../Api";
import { MessageSquareText, ShieldCheck, Truck, CreditCard } from "lucide-react";

const Checkout = () => {
  const { cart, total, clearCart, setCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const savedAddress = user?.addresses && user.addresses.length > 0 ? user.addresses[0] : {};

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(savedAddress.phone || user?.phone || "");
  const [street, setStreet] = useState(savedAddress.street || "");
  const [city, setCity] = useState(savedAddress.city || "");
  const [postalCode, setPostalCode] = useState(savedAddress.postalCode || "");
  const [country] = useState(savedAddress.country || "Bangladesh");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod"); // "cod" or "sslcommerz"

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoMessage, setPromoMessage] = useState("");

  const deliveryFee = 60;
  const discountAmount = appliedPromo
    ? appliedPromo.type === "percent"
      ? Math.min(total + deliveryFee, Math.round(((total + deliveryFee) * appliedPromo.value) / 100))
      : Math.min(total + deliveryFee, appliedPromo.value)
    : 0;
  const grandTotal = total + deliveryFee - discountAmount;

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    const promoCodes = {
      SAVE10: { code: "SAVE10", type: "percent", value: 10 },
      DINE50: { code: "DINE50", type: "flat", value: 50 },
    };
    const promo = promoCodes[code];
    if (!promo) {
      setAppliedPromo(null);
      setPromoMessage("Invalid promo code");
      return;
    }
    setAppliedPromo(promo);
    setPromoMessage(`${promo.code} applied successfully`);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 text-sm mb-6">Looks like you haven't added anything to your cart yet.</p>
        <button
          onClick={() => navigate("/menu")}
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2.5 rounded-xl transition"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (!street || !city || !phone) {
      setError("Please fill in address, city, and contact number");
      return;
    }

    setPlacing(true);

    try {
      const menuResponse = await API.get("/getMenu");
      const availableMenus = menuResponse.data.menus || menuResponse.data.data || [];
      const availableIds = new Set(availableMenus.map((menu) => (
        menu._id || menu.id
      )?.toString()));
      const validCart = cart.filter((item) => {
        const itemId = item._id || item.id || item.menuId || item.menuItem;
        return itemId && availableIds.has(itemId.toString());
      });

      if (validCart.length !== cart.length) {
        setCart(validCart);
        localStorage.setItem("cart", JSON.stringify(validCart));
        if (validCart.length === 0) {
          setError("The menu items in your cart are no longer available. Please choose items from the current menu.");
        } else {
          setError("Some unavailable items were removed from your cart. Please review the updated order.");
        }
        return;
      }

      const items = cart.map((item) => ({
        menuItem: (item._id || item.id || item.menuId || item.menuItem)?.toString(),
        quantity: Number(item.quantity),
      }));

      const payload = {
        paymentMethod,
        items,
        deliveryAddress: { name, street, city, postalCode, country },
        phone,
        notes: notes.trim(), // কাস্টমারের স্পেশাল নির্দেশ বা নোট
        totalAmount: grandTotal,
        promoCode: appliedPromo?.code || "",
      };

      const res = await API.post("/placeOrder", payload);

      if (res.data.status === "success") {
        if (paymentMethod === "cod") {
          clearCart();
          alert(`Order placed successfully! Order ID: ${res.data.orderId}`);
          navigate("/orders");
        } else {
          // Online payment - SSLCommerz gateway
          clearCart();
          window.location.href = res.data.url;
        }
      } else {
        setError(res.data.message || "Failed to place order");
      }
    } catch (err) {
      if (err?.response?.data?.message === "One or more menu items are no longer available") {
        try {
          const menuResponse = await API.get("/getMenu");
          const availableIds = new Set((menuResponse.data.menus || menuResponse.data.data || []).map((menu) => (
            menu._id || menu.id
          )?.toString()));
          const freshCart = cart.filter((item) => availableIds.has((item._id || item.id || item.menuId || item.menuItem)?.toString()));
          setCart(freshCart);
          localStorage.setItem("cart", JSON.stringify(freshCart));
          setError("Some unavailable items were removed from your cart. Please review and try again.");
        } catch {
          setError("Some menu items are no longer available. Please refresh your cart and try again.");
        }
      } else {
      setError(err?.response?.data?.message || "Something went wrong while placing your order");
      }
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">Checkout & Delivery</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* বাম পাশে - ডেলিভারি ফর্ম */}
        <div className="lg:col-span-2 space-y-6 bg-white rounded-2xl p-6 shadow-xs border border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-600" />
              <span>Delivery Details</span>
            </h2>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure Checkout
            </span>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 font-semibold uppercase">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm transition"
                required
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-semibold uppercase">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017xxxxxxxx"
                className="mt-1 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-semibold uppercase">Street Address / House / Flat</label>
            <textarea
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              rows={2}
              placeholder="e.g. House 12, Road 4, Sector 7, Uttara"
              className="mt-1 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm transition"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 font-semibold uppercase">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Dhaka / Kurigram"
                className="mt-1 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm transition"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-semibold uppercase">Postal Code (Optional)</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="1230"
                className="mt-1 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm transition"
              />
            </div>
          </div>

          {/* 📝 Cooking & Delivery Special Instructions */}
          <div>
            <label className="text-xs text-gray-700 font-bold uppercase flex items-center gap-1.5 mb-1">
              <MessageSquareText className="w-4 h-4 text-amber-600" />
              <span>Cooking & Delivery Instructions (Optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Please make the burger less spicy, add extra tissue napkins, or call before ringing the doorbell..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm transition"
            />
          </div>

          {/* Payment Method Selection */}
          <div className="pt-2">
            <label className="text-xs text-gray-500 font-semibold uppercase mb-3 block">Choose Payment Method</label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition ${
                  paymentMethod === "cod"
                    ? "border-amber-500 bg-amber-50/60 shadow-xs"
                    : "border-gray-100 bg-gray-50/50 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="accent-amber-600 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-gray-800 text-sm block">Cash on Delivery</span>
                  <span className="text-[11px] text-gray-500">Pay cash upon food arrival</span>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition ${
                  paymentMethod === "sslcommerz"
                    ? "border-amber-500 bg-amber-50/60 shadow-xs"
                    : "border-gray-100 bg-gray-50/50 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="sslcommerz"
                  checked={paymentMethod === "sslcommerz"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="accent-amber-600 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pay Online</span>
                  </span>
                  <span className="text-[11px] text-gray-500">bKash, Nagad, Card, etc.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ডান পাশে - অর্ডার সামারি */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 h-fit space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Order Summary</h2>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item._id || item.id} className="flex justify-between items-center text-sm text-gray-600">
                <span className="font-medium text-gray-800 truncate max-w-[170px]">{item.name} × {item.quantity}</span>
                <span className="font-semibold text-gray-900">৳{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-sm text-gray-600 border-t pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">৳{total}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-gray-900">৳{deliveryFee}</span>
            </div>
            <div className="flex gap-2 pt-1">
              <input
                value={promoInput}
                onChange={(event) => setPromoInput(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), applyPromo())}
                placeholder="Promo code"
                className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase focus:border-amber-500 focus:outline-none"
                disabled={Boolean(appliedPromo)}
              />
              {appliedPromo ? (
                <button type="button" onClick={() => { setAppliedPromo(null); setPromoInput(""); setPromoMessage(""); }} className="rounded-lg border border-gray-200 px-3 text-gray-500 hover:bg-gray-50" aria-label="Remove promo code">✕</button>
              ) : (
                <button type="button" onClick={applyPromo} className="rounded-lg bg-gray-900 px-3 text-sm font-bold text-white hover:bg-gray-700">Apply</button>
              )}
            </div>
            {promoMessage && <p className={`text-xs font-semibold ${appliedPromo ? "text-emerald-600" : "text-red-500"}`}>{promoMessage}</p>}
            {appliedPromo && <div className="flex justify-between text-emerald-600"><span>Promo discount</span><span className="font-bold">- ৳{discountAmount}</span></div>}
            <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
              <span>Total Bill</span>
              <span className="text-amber-600">৳{grandTotal}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={placing}
            className="w-full bg-amber-600 hover:bg-amber-700 active:scale-95 text-white py-3.5 rounded-xl font-bold transition shadow-md shadow-amber-600/25 disabled:opacity-60 cursor-pointer"
          >
            {placing ? "Placing Order..." : `Place Order (৳${grandTotal})`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;