import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../config";

const fallbackDishes = [
  {
    id: "fallback-lamb",
    name: "Herb-Crusted Grilled Lamb",
    tag: "Chef Special",
    description: "Tender lamb, garden herbs, and a bright roasted garlic jus.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=90&w=1200&auto=format&fit=crop",
  },
  {
    id: "fallback-scallops",
    name: "Pan-Seared Scallops & Cream",
    tag: "Gluten-Free",
    description: "Silken cream, seared scallops, and a delicate citrus finish.",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=90&w=1200&auto=format&fit=crop",
  },
  {
    id: "fallback-lava-cake",
    name: "Decadent Chocolate Lava Cake",
    tag: "Sweet Finish",
    description: "Warm dark chocolate with a molten center and soft vanilla cream.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=90&w=1200&auto=format&fit=crop",
  },
  {
    id: "fallback-burger",
    name: "Crispy Truffle Fries & Burger",
    tag: "Guest Favorite",
    description: "Crisp fries and a generous, flame-grilled signature stack.",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?q=90&w=1200&auto=format&fit=crop",
  },
  {
    id: "fallback-dumplings",
    name: "Spicy Dumplings & Broth",
    tag: "House Crafted",
    description: "Steamed dumplings, aromatic broth, and a warm chili finish.",
    image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=90&w=1200&auto=format&fit=crop",
  },
];

const getImageUrl = (image) => (
  image?.startsWith("/uploads/") ? `${BACKEND_URL}${image}` : image
);

const Hero = ({ menuItems = [] }) => {
  const [activeDish, setActiveDish] = useState(0);
  const menuDishes = menuItems.slice(0, 5).map((menu, index) => ({
    id: menu._id || `menu-${index}`,
    name: menu.name,
    tag: menu.category || "Freshly Prepared",
    description: menu.description || "Prepared fresh in our kitchen with care.",
    image: getImageUrl(menu.image || menu.imageUrl) || fallbackDishes[index].image,
  }));
  const dishes = [...menuDishes, ...fallbackDishes].slice(0, 5);

  useEffect(() => {
    setActiveDish((current) => current % dishes.length);
  }, [dishes.length]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveDish((current) => (current + 1) % dishes.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [dishes.length]);

  const rotateDish = (direction) => {
    setActiveDish((current) => (current + direction + dishes.length) % dishes.length);
  };

  const getDishOffset = (index) => {
    const offset = (index - activeDish + dishes.length) % dishes.length;
    if (offset === 0) return 0;
    if (offset === 1 || offset === -(dishes.length - 1)) return 1;
    if (offset === dishes.length - 1) return -1;
    return null;
  };

  const active = dishes[activeDish] || dishes[0];

  return (
    <section className="relative overflow-hidden bg-[#17120e] py-14 text-white sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(184,115,51,0.2),transparent_36%),linear-gradient(115deg,#17120e_0%,#241710_50%,#11100e_100%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-200/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">
            <Sparkles className="h-3.5 w-3.5" /> {active.tag}
          </span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-orange-300">DineFlow signature table</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Artistry in <span className="text-amber-300">Every Bite</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-300 sm:text-base">
            Indulge in handcrafted delicacies made with fresh, organic ingredients and a little culinary theatre.
          </p>
        </div>

        <div className="relative mx-auto mt-10 h-112 max-w-5xl overflow-hidden sm:mt-12 sm:h-136">
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/10 bg-amber-100/3 blur-xs sm:h-80 sm:w-80" />
          {dishes.map((dish, index) => {
            const offset = getDishOffset(index);
            const isActive = offset === 0;
            const isVisible = offset !== null;
            const positionClass = isActive
              ? "left-1/2 -translate-x-1/2 scale-100 opacity-100"
              : offset === -1
                ? "left-1/2 -translate-x-[calc(50%+9.5rem)] scale-75 opacity-45 sm:-translate-x-[calc(50%+15rem)] sm:scale-85 sm:opacity-65"
                : "left-1/2 translate-x-[calc(-50%+9.5rem)] scale-75 opacity-45 sm:translate-x-[calc(-50%+15rem)] sm:scale-85 sm:opacity-65";
            const visibilityClass = isVisible ? "" : "pointer-events-none opacity-0";
            const depthClass = isActive ? "z-20" : "z-10";

            return (
              <Link
                key={dish.id}
                to="/menu"
                aria-label={`Explore ${dish.name}`}
                className={`absolute top-1/2 ${depthClass} h-56 w-56 -translate-y-1/2 rounded-full transition-all duration-700 ease-out sm:h-72 sm:w-72 ${positionClass} ${visibilityClass}`}
              >
                <span className={`absolute -inset-3 rounded-full transition-all duration-700 ${isActive ? "border-2 border-amber-300 shadow-[0_0_45px_rgba(245,158,11,0.55)]" : "border border-white/10"}`} />
                <span className="block h-full w-full overflow-hidden rounded-full border-10 border-[#33251b] bg-[#2b2018] p-1 shadow-[0_18px_45px_rgba(0,0,0,0.5)] sm:border-12">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="h-full w-full rounded-full object-cover"
                    onError={(event) => { event.currentTarget.src = fallbackDishes[index % fallbackDishes.length].image; }}
                  />
                </span>
                {isActive && <span className="absolute inset-x-0 -bottom-12 text-center text-sm font-bold text-amber-100 sm:-bottom-14 sm:text-base">{dish.name}</span>}
              </Link>
            );
          })}

          <button type="button" onClick={() => rotateDish(-1)} aria-label="Previous dish" className="absolute left-2 top-1/2 z-30 -translate-y-1/2 rounded-full border border-amber-200/25 bg-black/30 p-3 text-amber-100 backdrop-blur transition hover:border-amber-300 hover:bg-amber-300 hover:text-stone-950 sm:left-8">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => rotateDish(1)} aria-label="Next dish" className="absolute right-2 top-1/2 z-30 -translate-y-1/2 rounded-full border border-amber-200/25 bg-black/30 p-3 text-amber-100 backdrop-blur transition hover:border-amber-300 hover:bg-amber-300 hover:text-stone-950 sm:right-8">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-5 text-center sm:flex-row">
          <Link to="/menu" className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-6 py-3 text-sm font-black text-stone-950 shadow-[0_8px_25px_rgba(245,158,11,0.22)] transition hover:bg-amber-200">
            Explore Menu <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2" aria-label={`Dish ${activeDish + 1} of ${dishes.length}`}>
            {dishes.map((dish, index) => (
              <button key={dish.id} type="button" onClick={() => setActiveDish(index)} aria-label={`Show ${dish.name}`} className={`h-1.5 rounded-full transition-all ${index === activeDish ? "w-8 bg-amber-300" : "w-2 bg-white/30 hover:bg-white/60"}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
