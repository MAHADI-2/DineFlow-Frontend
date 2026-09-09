import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await API.post("/forgotPassword", { email });
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</h1>
        <p className="text-gray-500 text-sm mb-6">
          Enter your email and we'll send you an OTP to reset your password.
        </p>

        {sent ? (
          <div className="space-y-4">
            <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl border border-green-100">
              If this email is registered, an OTP has been sent. Check your inbox.
            </div>
            <button
              onClick={() => navigate("/reset-password", { state: { email } })}
              className="w-full py-2.5 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600"
            >
              I have the OTP, Reset Password
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 font-medium uppercase">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send OTP"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Remembered your password?{" "}
              <span onClick={() => navigate("/login")} className="text-orange-600 font-semibold cursor-pointer hover:underline">
                Login
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
