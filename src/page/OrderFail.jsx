import { useParams, useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";

const OrderFail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-10 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-9 h-9 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-500 text-sm mb-1">
          Something went wrong while processing your payment.
        </p>
        <p className="text-gray-800 font-semibold text-sm mb-6">
          Order ID: {orderId}
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/cart")}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50"
          >
            Back to Cart
          </button>
          <button
            onClick={() => navigate("/checkout")}
            className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderFail;
