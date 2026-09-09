
import Layout from './components/Layout/Layout';
import Home from './page/Home';
import Menu from './page/Menu';
 import {Routes,Route} from 'react-router-dom'
import Cart from './page/Cart';
import {ContextProvider} from './context/CartContext'
import AuthProvider from './context/Auth';
import Register from './page/Register';
import Login from './page/Login';
import OTP from './page/OTP';
import Profile from './page/Profile';
import EditProfile from './page/EditProfile';
import Checkout from './page/Checkout';
import Order from './page/Order';
import Orderdetails from './page/Orderdetails';
import AdminOrders from "./page/AdminOrders";
import AdminMenu from './page/AdminMenu';
import OrderSuccess from './page/OrderSuccess';
import OrderFail from './page/OrderFail';
import OrderCancel from './page/OrderCancel';
import ForgotPassword from './page/ForgotPassword';
import ResetPassword from './page/ResetPassword';
import NotFound from './page/NotFound';
function App() {
  return (
     <ContextProvider>
      <AuthProvider>
    <Layout>
      
    <Routes>
     
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<OTP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/edit" element={<EditProfile />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders" element={<Order />} />
      <Route path="/orderdetails/:orderId" element={<Orderdetails />} />
      <Route path="/order/success/:orderId" element={<OrderSuccess />} />
      <Route path="/order/fail/:orderId" element={<OrderFail />} />
      <Route path="/order/cancel/:orderId" element={<OrderCancel />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
      <Route path="/admin/menu" element={<AdminMenu />} />
      <Route path="*" element={<NotFound />} />
    
    </Routes>
    
    </Layout>
    </AuthProvider>
      </ContextProvider>
  );
}

export default App;