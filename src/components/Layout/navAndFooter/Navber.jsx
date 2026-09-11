import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Menu, X, ShoppingCart, User, ShieldCheck, UtensilsCrossed, CalendarDays } from 'lucide-react';
import { useAuth } from '../../../context/useAuth';
import { useCart } from '../../../context/useCart';
import API from '../../../Api';

const notificationStorageKey = (userId) => `dineflowNotifications:${userId}`;
const snapshotStorageKey = (userId) => `dineflowStatusSnapshot:${userId}`;

const relativeTime = (timestamp) => {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
};

const statusNotification = (type, item) => {
  if (type === 'table' && item.status === 'confirmed') {
    return { title: 'Table Reserved', message: 'Your table has been confirmed. See you soon!', path: '/book-table', icon: '🍽️' };
  }

  const orderMessages = {
    confirmed: ['Order Confirmed', 'Your delicious food is being prepared by our chefs!', '🍲'],
    preparing: ['Order Confirmed', 'Your delicious food is being prepared by our chefs!', '🍲'],
    ready: ['Out for Delivery', 'Your meal is on the way with our rider!', '🚚'],
    delivered: ['Delivered', 'Order delivered. Enjoy your meal!', '✅'],
  };
  const message = orderMessages[item.status];
  if (!message) return null;
  return { title: message[0], message: message[1], path: `/orderdetails/${item.orderId || item._id}`, icon: message[2] };
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // CartContext থেকে মোট আইটেম কোয়ান্টিটি হিসাব করা
  const cartCount = (cart || []).reduce(
    (total, item) => total + (Number(item.quantity) || 1),
    0
  );
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    if (!user?._id && !user?.id) {
      const clearTimer = window.setTimeout(() => setNotifications([]), 0);
      return () => window.clearTimeout(clearTimer);
    }

    const userId = user._id || user.id;
    let active = true;
    const readStorage = (key, fallback) => {
      try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; }
    };

    const checkForUpdates = async () => {
      try {
        const [ordersResponse, tablesResponse] = await Promise.all([
          API.get('/orders'),
          API.get('/tableBookings/mine'),
        ]);
        const orders = ordersResponse.data.data || [];
        const tables = tablesResponse.data.data || [];
        const items = [
          ...orders.map((item) => ({ ...item, type: 'order' })),
          ...tables.map((item) => ({ ...item, type: 'table' })),
        ];
        const snapshot = readStorage(snapshotStorageKey(userId), {});
        const existing = readStorage(notificationStorageKey(userId), []);
        const created = [];

        items.forEach((item) => {
          const itemId = item._id || item.orderId;
          const nextStatus = item.status || 'pending';
          const previousStatus = snapshot[`${item.type}:${itemId}`];
          const content = statusNotification(item.type, item);
          if (content && previousStatus && previousStatus !== nextStatus) {
            created.push({
              id: `${item.type}:${itemId}:${nextStatus}`,
              ...content,
              createdAt: Date.now(),
              read: false,
            });
          }
          snapshot[`${item.type}:${itemId}`] = nextStatus;
        });

        const nextNotifications = [...created, ...existing].filter((notification, index, list) => (
          list.findIndex((candidate) => candidate.id === notification.id) === index
        )).slice(0, 20);
        localStorage.setItem(snapshotStorageKey(userId), JSON.stringify(snapshot));
        localStorage.setItem(notificationStorageKey(userId), JSON.stringify(nextNotifications));
        if (active) setNotifications(nextNotifications);
      } catch (error) {
        if (active) console.error('Unable to refresh notifications:', error);
      }
    };

    const initialCheck = window.setTimeout(checkForUpdates, 0);
    const refreshTimer = window.setInterval(checkForUpdates, 20000);
    return () => {
      active = false;
      window.clearTimeout(initialCheck);
      window.clearInterval(refreshTimer);
    };
  }, [user]);

  const markAllRead = () => {
    const nextNotifications = notifications.map((notification) => ({ ...notification, read: true }));
    setNotifications(nextNotifications);
    if (user?._id || user?.id) localStorage.setItem(notificationStorageKey(user._id || user.id), JSON.stringify(nextNotifications));
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-amber-600">
              <img src="/dineflow-logo.svg" alt="DineFlow Logo" className="h-10 w-10 object-cover rounded-xl shadow-sm" />
              <span>DineFlow</span>
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
            <Link to="/about" className="text-gray-700 hover:text-amber-600 font-medium transition">About</Link>
            <Link to="/contact" className="text-gray-700 hover:text-amber-600 font-medium transition">Contact</Link>
            <Link to="/book-table" className="flex items-center gap-1.5 text-gray-700 hover:text-amber-600 font-medium transition">
              <CalendarDays className="w-4 h-4 text-orange-500" />
              <span>Book Table</span>
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
            {user && (
              <div className="relative">
                <button type="button" aria-label="Notifications" onClick={() => setNotificationsOpen((open) => !open)} className="relative rounded-xl p-2 text-gray-700 transition hover:bg-amber-50 hover:text-amber-600">
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] origin-top-right animate-[dropdown-in_160ms_ease-out] rounded-2xl border border-gray-100 bg-white p-3 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-gray-100 px-2 pb-3"><div><p className="text-sm font-black text-gray-900">Notifications</p><p className="text-[11px] text-gray-400">Your latest DineFlow updates</p></div><button type="button" onClick={markAllRead} className="text-[11px] font-bold text-amber-600 hover:text-amber-800">Mark all as read</button></div>
                    <div className="max-h-80 space-y-1 overflow-y-auto pt-2">
                      {notifications.length === 0 ? <p className="px-2 py-8 text-center text-xs text-gray-400">You are all caught up.</p> : notifications.map((notification) => <Link key={notification.id} to={notification.path} onClick={() => setNotificationsOpen(false)} className={`flex gap-3 rounded-xl p-3 transition hover:bg-amber-50 ${notification.read ? '' : 'bg-amber-50/60'}`}><span className="text-lg">{notification.icon}</span><span className="min-w-0"><span className="flex items-center gap-2 text-xs font-black text-gray-900">{notification.title}{!notification.read && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />}</span><span className="mt-0.5 block text-xs leading-5 text-gray-600">{notification.message}</span><span className="mt-1 block text-[10px] text-gray-400">{relativeTime(notification.createdAt)}</span></span></Link>)}
                    </div>
                  </div>
                )}
              </div>
            )}
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
          <Link to="/about" onClick={() => setIsOpen(false)} className="block py-2 font-medium text-gray-700 hover:text-amber-600">About</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)} className="block py-2 font-medium text-gray-700 hover:text-amber-600">Contact</Link>
          <Link
            to="/book-table"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 text-gray-700 hover:text-amber-600 font-medium py-2"
          >
            <CalendarDays className="w-4 h-4 text-orange-500" />
            Book Table
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
            {user && <button type="button" onClick={() => setNotificationsOpen((open) => !open)} className="relative flex items-center gap-2 py-2 font-medium text-gray-700"><Bell className="h-5 w-5" /> Alerts {unreadCount > 0 && <span className="rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">{unreadCount}</span>}</button>}
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
          {user && notificationsOpen && <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 px-1 pb-2"><p className="text-xs font-black text-gray-900">Latest updates</p><button type="button" onClick={markAllRead} className="text-[10px] font-bold text-amber-600">Mark all as read</button></div>
            <div className="max-h-64 space-y-1 overflow-y-auto pt-2">{notifications.length === 0 ? <p className="px-1 py-5 text-center text-xs text-gray-400">You are all caught up.</p> : notifications.map((notification) => <Link key={notification.id} to={notification.path} onClick={() => setIsOpen(false)} className="flex gap-2 rounded-xl p-2 hover:bg-white"><span>{notification.icon}</span><span><span className="block text-xs font-bold text-gray-900">{notification.title}</span><span className="block text-[11px] leading-4 text-gray-600">{notification.message}</span><span className="block text-[10px] text-gray-400">{relativeTime(notification.createdAt)}</span></span></Link>)}</div>
          </div>}
        </div>
      )}
    </nav>
  );
}