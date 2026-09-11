import { useState } from "react";
import { Clock3, Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "react-hot-toast";

const contactDetails = [
    { icon: MapPin, label: "Address", value: "House 12, Road 4, Dhanmondi / Gulshan-2, Dhaka, Bangladesh" },
    { icon: Phone, label: "Phone", value: "+880 1712-383728" },
    { icon: Mail, label: "Email", value: "support@dineflow.com" },
    { icon: Clock3, label: "Working Hours", value: "Monday - Sunday (10:00 AM - 11:30 PM)" },
];

const Contact = () => {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    const handleSubmit = (event) => {
        event.preventDefault();
        toast.success("Thanks for reaching out. Our team will reply shortly.");
        setForm({ name: "", email: "", subject: "", message: "" });
    };

    return (
        <div className="min-h-[85vh] bg-[#fffaf3] px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-6xl">
                <div className="max-w-2xl"><p className="text-xs font-black uppercase tracking-[0.3em] text-orange-500">We are here to help</p><h1 className="mt-3 text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">Let&apos;s make your next meal memorable.</h1><p className="mt-5 leading-7 text-gray-600">Questions about an order, a table, or the DineFlow experience? Send us a note and our restaurant team will get back to you.</p></div>
                <div className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">{contactDetails.map(({ icon: Icon, label, value }) => <div key={label} className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"><div className="flex items-start gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600"><Icon className="h-5 w-5" /></div><div><p className="text-xs font-black uppercase tracking-wider text-gray-400">{label}</p><p className="mt-1 text-sm font-semibold leading-6 text-gray-800">{value}</p></div></div></div>)}</div>
                    <form onSubmit={handleSubmit} className="rounded-3xl bg-gray-950 p-6 text-white shadow-xl sm:p-8"><div className="mb-7"><h2 className="text-2xl font-black">Send a message</h2><p className="mt-1 text-sm text-gray-400">We usually respond within one business day.</p></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold uppercase tracking-wider text-gray-300">Name<input name="name" value={form.name} onChange={updateField} required className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm font-normal text-white outline-none transition focus:border-orange-400" /></label><label className="text-xs font-bold uppercase tracking-wider text-gray-300">Email<input type="email" name="email" value={form.email} onChange={updateField} required className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm font-normal text-white outline-none transition focus:border-orange-400" /></label><label className="text-xs font-bold uppercase tracking-wider text-gray-300 sm:col-span-2">Subject<input name="subject" value={form.subject} onChange={updateField} required className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm font-normal text-white outline-none transition focus:border-orange-400" /></label><label className="text-xs font-bold uppercase tracking-wider text-gray-300 sm:col-span-2">Message<textarea name="message" value={form.message} onChange={updateField} required rows="5" className="mt-2 w-full resize-y rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm font-normal text-white outline-none transition focus:border-orange-400" /></label></div><button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-black text-white transition hover:bg-orange-400"><Send className="h-4 w-4" /> Send Message</button></form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
