import { useState, useEffect } from "react";
import API from "../Api";
import { BACKEND_URL } from "../config";
import { useCart } from "../context/useCart";
import { Search, Sparkles, History, X, Star } from "lucide-react";
import { getMenuCategory } from "../utils/menuCategory";

const getImageUrl = (image) => {
  if (!image) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
  return image.startsWith("/uploads/") ? `${BACKEND_URL}${image}` : image;
};

const MenuItem = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const savedSearches = JSON.parse(localStorage.getItem("recentFoodSearches"));
      return Array.isArray(savedSearches) ? savedSearches : [];
    } catch {
      localStorage.removeItem("recentFoodSearches");
      return [];
    }
  });

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const res = await API.get("/getMenu");
        if (res.data.status === "success") {
          setMenus((res.data.menus || []).map((menu) => ({
            ...menu,
            category: getMenuCategory(menu),
          })));
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
    window.addEventListener("focus", fetchMenus);

    return () => window.removeEventListener("focus", fetchMenus);
  }, []);

  const handleSaveSearch = (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      const updated = [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
      localStorage.setItem("recentFoodSearches", JSON.stringify(updated));
      return updated;
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveSearch(searchQuery);
    }
  };

  const removeRecentSearch = (e, itemToRemove) => {
    e.stopPropagation();
    const updated = recentSearches.filter((item) => item !== itemToRemove);
    setRecentSearches(updated);
    localStorage.setItem("recentFoodSearches", JSON.stringify(updated));
  };

  const clearAllHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentFoodSearches");
  };

  const categories = ["All", "Appetizer", "Main", "Sides", "Dessert", "Beverage"];

  const cleanSearch = searchQuery.trim().toLowerCase();

  const filteredMenus = menus.filter((item) => {
    const itemCategory = getMenuCategory(item);
    const matchesCategory = selectedCategory === "All" || selectedCategory.toUpperCase() === itemCategory;
    const itemName = (item.name || "").toLowerCase();
    const itemDesc = (item.description || "").toLowerCase();
    const itemCat = itemCategory.toLowerCase();

    const matchesSearch =
      cleanSearch === "" ||
      itemName.includes(cleanSearch) ||
      itemDesc.includes(cleanSearch) ||
      itemCat.includes(cleanSearch);

    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return <div className="text-center py-20 text-gray-400 font-medium">Loading mouth-watering food...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* হেডার টাইটেল */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <span className="text-orange-600 bg-orange-50 font-bold text-xs uppercase px-3 py-1 rounded-full border border-orange-200 inline-flex items-center gap-1 mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Delicious Menu
        </span>
        <h2 className="text-3xl font-extrabold text-gray-900">Our Delicious Food Menu</h2>
        <p className="text-gray-500 text-sm mt-1">Order your favorite meals made with fresh ingredients</p>
      </div>

      {/* সার্চ ও ক্যাটাগরি */}
      <div className="mb-8 max-w-2xl mx-auto space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search food by name (e.g. burger, fries, chicken)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => handleSaveSearch(searchQuery)}
            className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* রিসেন্ট সার্চ চিপস */}
        {recentSearches.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 px-1">
            <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
              <History className="w-3.5 h-3.5" />
              <span>Recent:</span>
            </div>
            
            {recentSearches.map((item) => (
              <button
                key={item}
                onClick={() => setSearchQuery(item)}
                className="group flex items-center gap-1.5 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-lg border border-gray-200 hover:border-orange-200 transition cursor-pointer"
              >
                <span>{item}</span>
                <span
                  onClick={(e) => removeRecentSearch(e, item)}
                  className="text-gray-400 group-hover:text-orange-600 hover:scale-125 transition ml-0.5"
                >
                  <X className="w-3 h-3" />
                </span>
              </button>
            ))}

            <button
              onClick={clearAllHistory}
              className="text-[11px] text-gray-400 hover:text-red-500 hover:underline transition ml-1"
            >
              Clear
            </button>
          </div>
        )}

        {/* ক্যাটাগরি বাটন */}
        <div className="flex flex-wrap justify-center gap-2 pt-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                selectedCategory === cat
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ফুড আইটেম গ্রিড */}
      {filteredMenus.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 max-w-md mx-auto">
          <p className="text-gray-600 font-semibold">No food items found matching "{searchQuery}"</p>
          <p className="text-gray-400 text-xs mt-1">Try another search or pick a category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMenus.map((menu) => {
            // 🔥 সরাসরি ডাটাবেজ থেকে আসল রেটিং এবং রিভিউ সংখ্যা
            const realRating = menu.rating && menu.rating > 0 ? menu.rating : 0;
            const totalReviews = menu.numReviews || (menu.reviews ? menu.reviews.length : 0);

            return (
              <div
                key={menu._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-200 group"
              >
                <div>
                  {/* ইমেজ ও ব্যাজ */}
                  <div className="h-44 w-full bg-gray-100 overflow-hidden relative">
                    <img
                      src={getImageUrl(menu.image || menu.imageUrl)}
                      alt={menu.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
                      }}
                    />
                    
                    {/* ক্যাটাগরি ব্যাজ */}
                    {menu.category && (
                      <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs text-orange-600 font-bold text-[11px] px-2.5 py-0.5 rounded-full shadow-xs uppercase">
                        {menu.category}
                      </span>
                    )}

                    {/* ⭐ আসল ডাটাবেজ রেটিং ব্যাজ */}
                    <div className="absolute bottom-2 left-2 bg-gray-900/85 backdrop-blur-xs text-white px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm text-xs">
                      <Star className={`w-3.5 h-3.5 ${realRating > 0 ? "fill-amber-400 text-amber-400" : "text-gray-400"}`} />
                      <span className="font-bold text-white text-[11px]">
                        {realRating > 0 ? realRating : "New"}
                      </span>
                      {totalReviews > 0 && (
                        <span className="text-[10px] text-gray-300">({totalReviews})</span>
                      )}
                    </div>

                    {/* আইটেম বন্ধ থাকলে "Out of Stock" দেখানো */}
                    {menu.isAvailable === false && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold text-sm uppercase tracking-wider border border-white/40 px-3 py-1 rounded-lg">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* টেক্সট ডিটেইলস */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1.5">
                      <h3 className="font-bold text-gray-800 text-sm group-hover:text-orange-600 transition">
                        {menu.name}
                      </h3>
                      <span className="font-bold text-orange-600 text-sm whitespace-nowrap ml-2">৳{menu.price}</span>
                    </div>
                    
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                      {menu.description || "Prepared fresh with herbs and rich secret sauces."}
                    </p>

                    {/* প্রেপারেশন টাইম ও ফ্রেশ ইনফো */}
                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-50">
                      <span>⏱️ {menu.preparationTime || 20} mins prep</span>
                      <span className="text-emerald-600 font-semibold">● Fresh Made</span>
                    </div>
                  </div>
                </div>

                {/* বাটন */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => addToCart(menu)}
                    disabled={menu.isAvailable === false}
                    className="mt-1 w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-xl active:scale-95 transition text-center shadow-xs text-sm cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed disabled:active:scale-100"
                  >
                    {menu.isAvailable === false ? "Unavailable" : "Add To Cart"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MenuItem;