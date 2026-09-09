import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../Api";
import { CheckCircle2 } from "lucide-react";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyOrder = async () => {
      try {
        const response = await API.get(`/orderDetails/${orderId}`);
        setVerified(response.data.status === "success" && response.data.data?.paymentStatus === "paid");
      } catch {
        setVerified(false);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) verifyOrder();
  }, [orderId]);

  if (loading) return <div className="text-center py-20 text-gray-500">Verifying payment...</div>;

  if (!verified) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 text-center">
        <div><h1 className="text-xl font-bold text-gray-900">Payment status is still pending</h1><p className="text-gray-500 mt-2">Please check My Orders before trying again.</p><button onClick={() => navigate("/orders")} className="mt-5 bg-orange-500 text-white px-5 py-2 rounded-xl">My Orders</button></div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-10 text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-9 h-9 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 text-sm mb-1">
          Your order has been confirmed.
        </p>
        <p className="text-gray-800 font-semibold text-sm mb-6">
          Order ID: {orderId}
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/orders")}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50"
          >
            My Orders
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
