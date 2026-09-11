import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../Api";
import toast from "react-hot-toast";

const OTP = () => {

    const [otp, setOtp] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email;
    const fallbackOtp = location.state?.fallbackOtp;

    const handleSubmit = async (e) => {

        e.preventDefault();
        setSubmitting(true);

        try {

            await API.post(
                "/verifyOtp",
                {
                    email: email,
                    otp: otp
                }
            );

            toast.success("✅ Email Verified Successfully! Redirecting to login...");
            navigate("/login", { state: { email } });

        } catch (error) {

            console.error(error);
            const message = error.response?.data?.message || "OTP verification failed";
            toast.error(message.toLowerCase().includes("otp") ? "Invalid OTP code. Please try again." : message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white shadow-xl border border-gray-100 rounded-2xl p-8 transition-all text-center">

                <div className="mb-6">
                    <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">OTP Verification</h2>
                    <p className="text-sm text-gray-500 mt-2">
                        Please enter the verification code sent to <br />
                        <span className="font-semibold text-indigo-600">{email || "your email"}</span>
                    </p>
                    <p className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-left text-xs leading-5 text-amber-800">
                        {fallbackOtp
                            ? `Verification code sent to your email! (If email delivery is delayed on free server, use code: ${fallbackOtp} for testing)`
                            : "Verification code sent to your email!"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 text-left">

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Verification Code</label>
                        <input
                            type="text"
                            required
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) =>
                                setOtp(e.target.value)
                            }
                            className="w-full px-4 py-3 text-center text-xl tracking-widest text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all text-sm"
                    >
                        {submitting ? "Verifying..." : "Verify OTP"}
                    </button>

                </form>

            </div>
        </div>
    );
};

export default OTP;