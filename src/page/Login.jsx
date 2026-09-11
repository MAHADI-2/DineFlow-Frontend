import { useState } from "react";
import API from "../Api";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const fillCredentials = (nextEmail, nextPassword) => {
        setEmail(nextEmail);
        setPassword(nextPassword);
        setError("");
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try{
            const { data } = await API.post("/login", { email, password });
            const {  user, token } = data;
            loginUser(user, token);
            alert("Login Successfull");
            navigate("/");
        
        }
            
        catch(err){
            setError(err?.response?.data?.message || "Unable to sign in. Please try again.");
        } finally {
            setSubmitting(false);
        }

    }


    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white shadow-xl border border-gray-100 rounded-2xl p-8 transition-all">
                
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Welcome Back</h2>
                    <p className="text-sm text-gray-500 mt-1">Please sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
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
                            minLength="6"
                            maxLength="20"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                        />
                        <div className="text-right mt-1.5">
                            <span
                                onClick={() => navigate("/forgot-password")}
                                className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
                            >
                                Forgot Password?
                            </span>
                        </div>
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all text-sm"
                    >
                        {submitting ? "Signing in..." : "Login"}
                    </button>
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                </form>

                <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">Quick Test Credentials</h3>
                        <span className="text-[11px] text-indigo-600">Authorized accounts only</span>
                    </div>
                    <div className="mt-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2">
                            <span className="min-w-0 truncate text-gray-700">👤 Customer: customer@dineflow.com <span className="text-gray-400">(Pass: 123456)</span></span>
                            <button type="button" onClick={() => fillCredentials("customer@dineflow.com", "123456")} className="shrink-0 font-bold text-indigo-600 hover:text-indigo-800">Fill</button>
                        </div>
                        <div className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2">
                            <span className="min-w-0 truncate text-gray-700">👑 Admin: admin@dineflow.com <span className="text-gray-400">(Pass: admin123)</span></span>
                            <button type="button" onClick={() => fillCredentials("admin@dineflow.com", "admin123")} className="shrink-0 font-bold text-indigo-600 hover:text-indigo-800">Fill</button>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default Login;