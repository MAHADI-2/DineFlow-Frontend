import { useCart } from '../context/useCart';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { BACKEND_URL } from "../config";
const Cart = () => {
  const { cart, removeFromCart, addToCart, total } = useCart();

  const { user } = useAuth();

  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <ShoppingBag className="w-16 h-16 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-800">Your Cart is Empty</h2>
          <p className="text-gray-500">Looks like you haven't added anything to your cart yet.</p>
        </div>
      </div>
    );
  }


const handleCheckout = () => {

  if (!user) {
    navigate("/login");
    return;
  }

  navigate("/checkout");
};

  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">My Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div 
              key={item._id} 
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 transition hover:shadow-md"
            >
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <img 
                  className="w-24 h-24 object-cover rounded-xl border border-gray-100 flex-shrink-0" 
                  src={item.image?.startsWith("/uploads/") ? `${BACKEND_URL}${item.image}` : (item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c")} 
                  alt={item.name} 
                  onError={(event) => { event.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"; }}
                />
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{item.name}</h2>
                  <p className="text-amber-600 font-medium mt-1">৳{item.price}</p>
                </div>
              </div>

              {/* Quantity Controls & Remove */}
              <div className="flex items-center justify-between w-full sm:w-auto space-x-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <button 
                    onClick={() => removeFromCart(item)} 
                    className="p-2 text-gray-600 hover:bg-gray-200 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-semibold text-gray-800">{item.quantity}</span>
                  <button 
                    onClick={() => addToCart(item)} 
                    className="p-2 text-gray-600 hover:bg-gray-200 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button 
                  onClick={() => removeFromCart(item)}
                  className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
                  title="Remove Item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Box */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Order Summary</h2>
          
          <div className="space-y-3 text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">৳{total}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-gray-900">৳60</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
              <span>Total Bill</span>
              <span className="text-amber-600">৳{total + 60}</span>
            </div>
          </div>

          <button onClick={handleCheckout} className="w-full bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 transition shadow-lg shadow-amber-600/25">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;