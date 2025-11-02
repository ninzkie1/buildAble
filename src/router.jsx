import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { LandingPage } from "./pages/LandingPage";
import { Feed } from "./pages/Feed";
import  Cart  from "./pages/Cart";
import LoginPage from "./pages/LoginPage";
import Register from "./pages/Register";
import AdminPanel from "./pages/admin/AdminPannel";
import AdminSellers from "./pages/admin/AdminSellers";
import UserHome from "./pages/user/UserHome";
import SellerHome from "./pages/seller/SellerDashboard";
import OrderHistory from "./pages/user/OrderHistory";
import OrderDetails from './pages/user/OrderDetails';
import ProductDetails from './pages/ProductDetails';
import SellerProducts from "./pages/seller/sellerProducts";
import ProductForm from './pages/seller/ProductForm';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import Profile from "./pages/Profile";
import TrackOrder from "./pages/user/TrackOrder";
import SellerOrders from "./pages/seller/Orders";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import VerifyEmail from './pages/VerifyEmail';
import GoogleAuth from './pages/GoogleAuth';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "shop", element: <Feed /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <Register /> },
      
      { 
        path: "cart", 
        element: <ProtectedRoute><Cart /></ProtectedRoute> 
      },
      { 
        path: "adminPanel", 
        element: <ProtectedRoute><AdminPanel /></ProtectedRoute> 
      },
      { 
        path: "admin/sellers", 
        element: <ProtectedRoute><AdminSellers /></ProtectedRoute> 
      },
      { 
        path: "userHome", 
        element: <ProtectedRoute><UserHome /></ProtectedRoute> 
      },
      { 
        path: "sellerHome", 
        element: <ProtectedRoute><SellerHome /></ProtectedRoute> 
      },
      { 
        path: "orders", 
        element: <ProtectedRoute><OrderHistory /></ProtectedRoute> 
      },
      {
        path: "orders/:id",
        element: <ProtectedRoute><OrderDetails /></ProtectedRoute>
      },
      {
        path: "/product/:id",
        element: <ProtectedRoute><ProductDetails /></ProtectedRoute>
      },
      {
        path: "/seller/products",
        element: <ProtectedRoute><SellerProducts/></ProtectedRoute>
      },
      {
        path: "/seller/products/new",
        element: <ProtectedRoute><ProductForm /></ProtectedRoute>
      },
      {
        path: "/seller/products/edit/:id",
        element: <ProtectedRoute><ProductForm /></ProtectedRoute>
      },
      {
        path: "/payment-success",
        element: <ProtectedRoute><PaymentSuccess /></ProtectedRoute>
      },
      {
        path: "/payment-failed",
        element: <ProtectedRoute><PaymentFailed /></ProtectedRoute>
      },
      {
        path: "/profile",
        element: <ProtectedRoute><Profile/></ProtectedRoute>
      },
      {
        path: "track-order/:orderId",
        element: <ProtectedRoute><TrackOrder /></ProtectedRoute>
      },
      {
        path: "seller/orders",
        element: <ProtectedRoute><SellerOrders /></ProtectedRoute>
      },
      {
        path: "/verify-email",
        element: <VerifyEmail />
      },
      {
        path: "/google-auth",
        element: <GoogleAuth />
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />
      },
      {
        path: "/reset-password",
        element: <ResetPassword />
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />
  }
]);

export default router;
