import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Api";
import toast from "react-hot-toast";

const Register = () => {

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState(""); // ফোন নম্বরের জন্য নতুন স্টেট
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();
        setSubmitting(true);

        try {
            const { data } = await API.post(
                "/createUser",
                {
                    name,
                    email,
                    password,
                    // ব্যাকএন্ডে addresses অবজেক্ট বা অ্যারে অবজেক্ট হিসেবে পাঠাতে হবে
                    addresses: {
                        street: address,
                        phone: phone
                    } 
                }
            );

            toast.success("🎉 Registration Successful! An OTP has been sent to your email.");
            navigate("/verify-otp", {
                state: {
                    email,
                    testOtp: data.otp || data.data?.otp || ""
                }
            });

        } catch (error) {

            console.error(error);
            const message = error.response?.data?.message || "Registration failed";
            if (error.response?.status === 400 && message.toLowerCase().includes("already exists")) {
                toast.custom((t) => (
                    <div className={`pointer-events-auto flex max-w-sm items-center gap-3 rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm text-gray-700 shadow-xl transition-all ${t.visible ? "animate-in fade-in slide-in-from-top-2" : "opacity-0"}`}>
                        <span className="text-lg">⚠️</span>
                        <span className="flex-1">This email is already registered!</span>
                        <button type="button" onClick={() => { toast.dismiss(t.id); navigate("/login", { state: { email } }); }} className="shrink-0 font-bold text-indigo-600 hover:text-indigo-800">Login</button>
                    </div>
                ), { duration: 2500 });
            } else {
                toast.error(message);
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white shadow-xl border border-gray-100 rounded-2xl p-8 transition-all">

                <div className="text-center mb-6">
                    <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Create Account</h2>
                    <p className="text-sm text-gray-500 mt-1">Please fill in the details to register</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Full Name</label>
                        <input
                            type="text"
                            required
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            required
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Password</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Address</label>
                        <input
                            type="text"
                            placeholder="123 Street, City"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Phone Number</label>
                        <input
                            type="text"
                            placeholder="01XXXXXXXXX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                        />
                    </div>

                        <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all text-sm"
                    >
                        {submitting ? "Creating account..." : "Register"}
                    </button>

                </form>

            </div>
        </div>
    );
};

export default Register;