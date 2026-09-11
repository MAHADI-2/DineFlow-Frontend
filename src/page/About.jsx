import { ArrowRight, Clock3, Leaf, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const pillars = [
    { icon: Clock3, title: "Fast Delivery", text: "Thoughtful preparation and dependable delivery keep every meal moving at the right pace." },
    { icon: Leaf, title: "Fresh Organic Ingredients", text: "We choose bright, honest ingredients so every plate tastes as good as it feels." },
    { icon: Sparkles, title: "Seamless Dine-In Table Reservation", text: "Plan your evening in a few taps and stay updated from request to reserved table." },
];

const About = () => (
    <div className="min-h-[85vh] bg-[#fffaf3] text-gray-900">
        <section className="relative overflow-hidden border-b border-orange-100 bg-gray-950 px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
            <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full border-[4rem] border-orange-500/15" />
            <div className="relative mx-auto max-w-6xl">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-400">The DineFlow story</p>
                <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">Crafted with passion, delivered with care.</h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-gray-300">About DineFlow: Crafted with passion, delivering culinary excellence and seamless restaurant management.</p>
            </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="grid gap-6 md:grid-cols-3">
                {pillars.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600"><Icon className="h-6 w-6" /></div><h2 className="mt-6 text-xl font-black">{title}</h2><p className="mt-3 text-sm leading-6 text-gray-500">{text}</p></article>)}
            </div>
            <div className="mt-16 grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
                <div><p className="text-xs font-black uppercase tracking-[0.25em] text-orange-500">Made for real moments</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">A calmer way to enjoy the restaurant.</h2><p className="mt-5 max-w-xl leading-7 text-gray-600">DineFlow brings the menu, the kitchen, the table, and the guest experience into one warm, dependable flow. Whether dinner is arriving at your door or waiting around the corner, every detail is designed to feel simple.</p><Link to="/contact" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600">Talk to our team <ArrowRight className="h-4 w-4" /></Link></div>
                <div className="rounded-3xl bg-orange-500 p-8 text-white shadow-xl"><p className="text-6xl font-black">01</p><p className="mt-5 text-xl font-black">One thoughtful flow</p><p className="mt-2 text-sm leading-6 text-orange-50">From first browse to final bite, DineFlow keeps the experience clear, quick, and human.</p></div>
            </div>
        </section>
    </div>
);

export default About;
