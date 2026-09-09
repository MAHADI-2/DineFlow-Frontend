import { useState, useEffect } from "react";
import { CartContext } from "./contexts";

export const ContextProvider = ({ children }) => {
  
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem("cart"));
      return Array.isArray(savedCart) ? savedCart : [];
    } catch {
      localStorage.removeItem("cart");
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  } , [cart]);
  

  // খাবার যোগ করার ফাংশন
  const addToCart = (item) => {
    // MongoDB-র _id চেক করা হচ্ছে
    const existingItem = cart.find((i) => i._id === item._id);

    if (existingItem) {
      // খাবার আগে থেকে থাকলে quantity ১ বাড়িয়ে স্টেট আপডেট করুন
      const updatedCart = cart.map((i) =>
        i._id === item._id ? { ...i, quantity: (i.quantity || 1) + 1 } : i
      );
      setCart(updatedCart); // ✅ setCart দেওয়া হলো
    } else {
      // নতুন খাবার হলে quantity: 1 দিয়ে যুক্ত করুন
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // খাবার কমানো বা রিমুভ করার ফাংশন
  const removeFromCart = (item) => {
    const existingItem = cart.find((i) => i._id === item._id);
    if (!existingItem) return;

    if (existingItem.quantity > 1) {
      // ১ এর বেশি থাকলে ১ কমিয়ে দিন
      const updatedCart = cart.map((i) =>
        i._id === item._id ? { ...i, quantity: i.quantity - 1 } : i
      );
      setCart(updatedCart);
    } else {
      // ১ টি থাকলে কার্ট থেকেই মুছে ফেলুন
      const updatedCart = cart.filter((i) => i._id !== item._id);
      setCart(updatedCart);
    }
  };

  // পুরো আইটেম একবারে মুছে ফেলার ফাংশন (দরকার হতে পারে)
  const deleteItemFromCart = (id) => {
    setCart(cart.filter((i) => i._id !== id));
  };

  // কার্ট খালি করার ফাংশন (অর্ডার সফল হওয়ার পর)
  const clearCart = () => {
    setCart([]);
  };

  // মোট পণ্যের সংখ্যা গণনা (সবগুলো quantity এর যোগফল)
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // মোট বিল গণনা (দাম * পরিমাণ)
  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * (item.quantity || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        deleteItemFromCart,
        clearCart,
        cartCount,
        total,
        setCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

