import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock3, Leaf, ShieldCheck, Star } from "lucide-react";
import Hero from "../components/Hero";
import API from "../Api";
import { BACKEND_URL } from "../config";
import { useCart } from "../context/useCart";

const fallbackImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";

const getImageUrl = (image) => {
    if (!image) return fallbackImage;
    return image.startsWith("/uploads/") ? `${BACKEND_URL}${image}` : image;
};

const Home = () => {
    const [featuredMenus, setFeaturedMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchFeaturedMenus = async () => {
            try {
                const res = await API.get("/getMenu");
                if (res.data.status === "success") {
                    const sortedMenus = [...(res.data.menus || [])]
                        .sort((first, second) => {
                            const ratingDifference = (second.rating || 0) - (first.rating || 0);
                            if (ratingDifference !== 0) return ratingDifference;
                            return new Date(second.createdAt || 0) - new Date(first.createdAt || 0);
                        })
                        .slice(0, 8);
                    setFeaturedMenus(sortedMenus);
                }
            } catch (error) {
                console.error("Error fetching featured menu:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedMenus();
    }, []);

    return (
        <div className="bg-white">
            <Hero />

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div>
                        <p className="text-orange-600 text-sm font-bold uppercase tracking-widest">Customer favorites</p>
                        <h2 className="text-3xl font-extrabold text-gray-900 mt-1">Popular &amp; Top-Rated Dishes</h2>
                        <p className="text-gray-500 mt-2">A few of the dishes our guests keep coming back for.</p>
                    </div>
                    <Link to="/menu" className="text-orange-600 font-bold hover:text-orange-700 transition whitespace-nowrap">
                        View Full Menu <span aria-hidden="true">→</span>
                    </Link>
                </div>

                {loading ? (
                    <div className="py-16 text-center text-gray-400">Loading customer favorites...</div>
                ) : featuredMenus.length === 0 ? (
                    <div className="py-16 text-center text-gray-400">Our menu is being prepared. Please check back soon.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {featuredMenus.map((menu) => {
                            const rating = menu.rating > 0 ? menu.rating : "New";
                            const reviews = menu.numReviews || menu.reviews?.length || 0;

                            return (
                                <article key={menu._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                                    <div className="h-48 bg-gray-100 relative overflow-hidden">
                                        <img
                                            src={getImageUrl(menu.image || menu.imageUrl)}
                                            alt={menu.name}
                                            className="w-full h-full object-cover"
                                            onError={(event) => { event.currentTarget.src = fallbackImage; }}
                                        />
                                        <span className="absolute top-3 left-3 bg-gray-900/85 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                            {rating}{reviews ? ` (${reviews})` : ""}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between gap-3">
                                            <h3 className="font-bold text-gray-900 truncate">{menu.name}</h3>
                                            <span className="font-bold text-orange-600 whitespace-nowrap">৳{menu.price}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-2 mt-2 min-h-10">{menu.description}</p>
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-3">
                                            <Clock3 className="w-3.5 h-3.5" /> {menu.preparationTime || 20} mins prep
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => addToCart(menu)}
                                            disabled={menu.isAvailable === false}
                                            className="w-full mt-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-xl transition"
                                        >
                                            {menu.isAvailable === false ? "Unavailable" : "Add To Cart"}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            <section className="border-y border-orange-100 bg-orange-50/70">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3"><Clock3 className="w-7 h-7 text-orange-600" /><div><h3 className="font-bold text-gray-900">Fast Delivery</h3><p className="text-sm text-gray-500">Fresh food at your door</p></div></div>
                    <div className="flex items-center gap-3"><Leaf className="w-7 h-7 text-emerald-600" /><div><h3 className="font-bold text-gray-900">100% Fresh Ingredients</h3><p className="text-sm text-gray-500">Prepared with care daily</p></div></div>
                    <div className="flex items-center gap-3"><ShieldCheck className="w-7 h-7 text-blue-600" /><div><h3 className="font-bold text-gray-900">Top Quality Service</h3><p className="text-sm text-gray-500">Made for a better meal</p></div></div>
                </div>
            </section>
        </div>
    );
};

export default Home;