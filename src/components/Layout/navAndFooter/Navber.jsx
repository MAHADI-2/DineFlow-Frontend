import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, ShieldCheck, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../../../context/useAuth';
import { useCart } from '../../../context/useCart';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cart } = useCart();

  // CartContext থেকে মোট আইটেম কোয়ান্টিটি হিসাব করা
  const cartCount = (cart || []).reduce(
    (total, item) => total + (Number(item.quantity) || 1),
    0
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-amber-600">
              DineFlow
            </Link>
          </div>

          {/* Desktop Menu Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-amber-600 font-medium transition">
              Home
            </Link>
            <Link to="/menu" className="text-gray-700 hover:text-amber-600 font-medium transition">
              Menu
            </Link>
            
            {/* সাধারণ ইউজারদের জন্য My Orders */}
            {user && (
              <Link to="/orders" className="text-gray-700 hover:text-amber-600 font-medium transition">
                My Orders
              </Link>
            )}

            {/* 🔥 শুধুমাত্র Admin হলে Admin Orders এবং Manage Menu ট্যাব দেখাবে */}
            {user && user.role === "admin" && (
              <>
                <Link 
                  to="/admin/orders" 
                  className="flex items-center gap-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 font-semibold px-3 py-1.5 rounded-lg border border-amber-200 transition"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Admin Orders</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                </Link>

                <Link 
                  to="/admin/menu" 
                  className="flex items-center gap-1.5 text-gray-700 hover:text-amber-600 font-medium transition"
                >
                  <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                  <span>Manage Menu</span>
                </Link>
              </>
            )}
          </div>

          {/* Right Side Icons (Cart & Profile) */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-amber-600 transition">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-amber-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transition-all">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/profile" 
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium transition"
                >
                  Profile
                </Link>
                <button 
                  onClick={logout} 
                  className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 font-medium transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="flex items-center space-x-1 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 font-medium transition"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Link>

                <Link 
                  to="/register" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-amber-600 focus:outline-none"
            >
              {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-4 space-y-3">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block text-gray-700 hover:text-amber-600 font-medium py-2"
          >
            Home
          </Link>
          <Link
            to="/menu"
            onClick={() => setIsOpen(false)}
            className="block text-gray-700 hover:text-amber-600 font-medium py-2"
          >
            Menu
          </Link>

          {user && (
            <Link
              to="/orders"
              onClick={() => setIsOpen(false)}
              className="block text-gray-700 hover:text-amber-600 font-medium py-2"
            >
              My Orders
            </Link>
          )}

          {/* মোবাইল মেনুতে Admin লিঙ্কগুলো */}
          {user && user.role === "admin" && (
            <div className="space-y-2 pt-1">
              <Link
                to="/admin/orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 text-amber-700 bg-amber-50 font-semibold px-3 py-2 rounded-lg border border-amber-200"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Admin Orders</span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse ml-auto"></span>
              </Link>

              <Link
                to="/admin/menu"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 text-gray-700 hover:text-amber-600 font-medium px-3 py-2 rounded-lg"
              >
                <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                <span>Manage Menu</span>
              </Link>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <Link
              to="/cart"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 text-gray-700 hover:text-amber-600 py-2 font-medium"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Cart ({cartCount})</span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                >
                  Profile
                </Link>
                <button 
                  onClick={() => { logout(); setIsOpen(false); }} 
                  className="bg-amber-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-amber-700 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="bg-amber-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-amber-700 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}