import { useCallback, useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import API from "../Api";

const BookTable = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: user?.name || "",
        phone: user?.phone || "",
        date: "",
        time: "",
        guests: "2",
        seatingArea: "Main dining room",
        occasion: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);

    const fetchBookings = useCallback(async () => {
        if (!user) return;
        try {
            const response = await API.get("/tableBookings/mine");
            if (response.data.status === "success") setBookings(response.data.data || []);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to load your reservations.");
        } finally {
            setLoadingBookings(false);
        }
    }, [user]);

    useEffect(() => {
        const initialFetch = window.setTimeout(fetchBookings, 0);
        const refreshTimer = window.setInterval(fetchBookings, 15000);
        return () => {
            window.clearTimeout(initialFetch);
            window.clearInterval(refreshTimer);
        };
    }, [fetchBookings]);

    const updateField = (event) => {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!user) {
            navigate("/login");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            await API.post("/tableBookings", { ...form, guests: Number(form.guests) });
            await fetchBookings();
            setSubmitted(true);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to request a table right now. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-[90vh] bg-orange-50/40 px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-start">
                <section className="rounded-3xl bg-gray-950 p-7 text-white shadow-xl sm:p-10">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">Dine in, your way</p>
                    <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Reserve your table.</h1>
                    <p className="mt-4 max-w-md text-sm leading-6 text-gray-300">Choose a time that works for you and let our team prepare a seat before you arrive.</p>
                    <div className="mt-10 grid gap-5 text-sm text-gray-300 sm:grid-cols-3">
                        <div><CalendarDays className="mb-2 h-5 w-5 text-orange-400" /><span>Easy booking</span></div>
                        <div><Clock3 className="mb-2 h-5 w-5 text-orange-400" /><span>Quick confirmation</span></div>
                        <div><Users className="mb-2 h-5 w-5 text-orange-400" /><span>Groups welcome</span></div>
                    </div>
                </section>

                <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                    {submitted ? (
                        <div className="py-10 text-center">
                            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
                            <h2 className="mt-4 text-2xl font-black text-gray-900">Table request received</h2>
                            <p className="mt-2 text-sm text-gray-500">Our team will confirm your reservation shortly.</p>
                            <button type="button" onClick={() => setSubmitted(false)} className="mt-6 font-bold text-orange-600 hover:text-orange-700">Make another booking</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div><h2 className="text-2xl font-black text-gray-900">Book a table</h2><p className="mt-1 text-sm text-gray-500">Tell us when you would like to dine.</p></div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="text-sm font-semibold text-gray-700">Full name<input name="name" value={form.name} onChange={updateField} required className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-normal outline-none focus:border-orange-500" /></label>
                                <label className="text-sm font-semibold text-gray-700">Phone number<input name="phone" value={form.phone} onChange={updateField} required className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-normal outline-none focus:border-orange-500" /></label>
                                <label className="text-sm font-semibold text-gray-700">Date<input type="date" name="date" value={form.date} onChange={updateField} min={new Date().toISOString().split("T")[0]} required className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-normal outline-none focus:border-orange-500" /></label>
                                <label className="text-sm font-semibold text-gray-700">Preferred time<input type="time" name="time" value={form.time} onChange={updateField} required className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-normal outline-none focus:border-orange-500" /></label>
                                <label className="text-sm font-semibold text-gray-700">Guests<select name="guests" value={form.guests} onChange={updateField} className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-normal outline-none focus:border-orange-500">{[1, 2, 3, 4, 5, 6, 7, 8].map((count) => <option key={count} value={count}>{count} {count === 1 ? "guest" : "guests"}</option>)}</select></label>
                                <label className="text-sm font-semibold text-gray-700">Seating area<select name="seatingArea" value={form.seatingArea} onChange={updateField} className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-normal outline-none focus:border-orange-500"><option>Main dining room</option><option>Window seating</option><option>Private room</option><option>Outdoor patio</option></select></label>
                                <label className="text-sm font-semibold text-gray-700">Occasion <span className="font-normal text-gray-400">(optional)</span><input name="occasion" value={form.occasion} onChange={updateField} placeholder="Birthday, dinner..." className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-normal outline-none focus:border-orange-500" /></label>
                            </div>
                            {error && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
                            <button type="submit" disabled={submitting} className="w-full rounded-xl bg-orange-500 py-3.5 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300">{submitting ? "Sending request..." : "Request reservation"}</button>
                        </form>
                    )}
                </section>
            </div>

            <section className="mx-auto mt-8 max-w-6xl rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">Live updates</p><h2 className="mt-1 text-2xl font-black text-gray-900">My Reservations</h2></div>
                    <span className="text-xs text-gray-400">Updates every 15 seconds</span>
                </div>
                {loadingBookings ? <p className="mt-6 text-sm text-gray-500">Loading reservations...</p> : bookings.length === 0 ? <p className="mt-6 text-sm text-gray-500">Your confirmed and pending table requests will appear here.</p> : (
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {bookings.map((booking) => {
                            const statusDetails = {
                                pending: { icon: "⏳", label: "Pending", message: "Reviewing by restaurant team", style: "border-amber-200 bg-amber-50 text-amber-800" },
                                confirmed: { icon: "✅", label: "Confirmed", message: "Table reserved for you!", style: "border-emerald-200 bg-emerald-50 text-emerald-800" },
                                seated: { icon: "🍽️", label: "Seated", message: "Guest currently seated", style: "border-blue-200 bg-blue-50 text-blue-800" },
                                cancelled: { icon: "❌", label: "Cancelled", message: "Reservation cancelled", style: "border-rose-200 bg-rose-50 text-rose-800" },
                            }[booking.status] || { icon: "⏳", label: "Pending", message: "Reviewing by restaurant team", style: "border-amber-200 bg-amber-50 text-amber-800" };
                            const bookingId = String(booking._id || "").slice(-4).toUpperCase();
                            return <article key={booking._id} className="rounded-2xl border border-gray-100 p-4">
                                <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-gray-400">Booking reference</p><p className="mt-1 font-black text-gray-900">TBL-{bookingId}</p></div><span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusDetails.style}`}>{statusDetails.icon} {statusDetails.label}</span></div>
                                <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-gray-400">Date & time</p><p className="font-semibold text-gray-700">{booking.date} at {booking.time}</p></div><div><p className="text-xs text-gray-400">Guests</p><p className="font-semibold text-gray-700">{booking.guests}</p></div><div className="col-span-2"><p className="text-xs text-gray-400">Seating area</p><p className="font-semibold text-gray-700">{booking.seatingArea || "Main dining room"}</p></div></div>
                                <p className={`mt-4 rounded-lg px-3 py-2 text-xs font-semibold ${statusDetails.style}`}>{statusDetails.message}</p>
                            </article>;
                        })}
                    </div>
                )}
            </section>
        </div>
    );
};

export default BookTable;
