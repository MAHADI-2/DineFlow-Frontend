import { useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, Users } from "lucide-react";
import { useAuth } from "../context/useAuth";

const BOOKINGS_KEY = "dineflowTableBookings";

const getStoredBookings = () => {
    try {
        return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
    } catch {
        return [];
    }
};

const BookTable = () => {
    const { user } = useAuth();
    const [form, setForm] = useState({
        name: user?.name || "",
        phone: user?.phone || "",
        date: "",
        time: "",
        guests: "2",
        occasion: "",
    });
    const [submitted, setSubmitted] = useState(false);

    const updateField = (event) => {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const booking = {
            ...form,
            guests: Number(form.guests),
            id: `TB-${Date.now().toString().slice(-6)}`,
            status: "pending",
            createdAt: new Date().toISOString(),
        };
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify([booking, ...getStoredBookings()]));
        setSubmitted(true);
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
                                <label className="text-sm font-semibold text-gray-700">Occasion <span className="font-normal text-gray-400">(optional)</span><input name="occasion" value={form.occasion} onChange={updateField} placeholder="Birthday, dinner..." className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-normal outline-none focus:border-orange-500" /></label>
                            </div>
                            <button type="submit" className="w-full rounded-xl bg-orange-500 py-3.5 font-bold text-white transition hover:bg-orange-600">Request reservation</button>
                        </form>
                    )}
                </section>
            </div>
        </div>
    );
};

export { BOOKINGS_KEY, getStoredBookings };
export default BookTable;
