// import { createBrowserRouter, Navigate } from "react-router-dom";
// import App from "./App";
// import { LandingPage } from "./pages/LandingPage";
// import { Feed } from "./pages/Feed";
// import  Cart  from "./pages/Cart";
// import LoginPage from "./pages/LoginPage";
// import Register from "./pages/Register";
// import AdminPanel from "./pages/admin/AdminPannel";
// import AdminSellers from "./pages/admin/AdminSellers";
// import UserHome from "./pages/user/UserHome";
// import SellerHome from "./pages/seller/SellerDashboard";
// import OrderHistory from "./pages/user/OrderHistory";
// import OrderDetails from './pages/user/OrderDetails';
// import ProductDetails from './pages/ProductDetails';
// import SellerProducts from "./pages/seller/sellerProducts";
// import ProductForm from './pages/seller/ProductForm';
// import PaymentSuccess from './pages/PaymentSuccess';
// import PaymentFailed from './pages/PaymentFailed';
// import Profile from "./pages/Profile";
// import TrackOrder from "./pages/user/TrackOrder";
// import SellerOrders from "./pages/seller/Orders";
// import NotFound from "./pages/NotFound";
// import ProtectedRoute from "./components/ProtectedRoute";
// import VerifyEmail from './pages/VerifyEmail';
// import GoogleAuth from './pages/GoogleAuth';
// import ForgotPassword from './pages/ForgotPassword';
// import ResetPassword from './pages/ResetPassword';
// import ContactDev from './pages/ContactDev';

// export const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <App />,
//     errorElement: <NotFound />,
//     children: [
//       // ContactDev route - accessible
//       { path: "contact-dev", element: <ContactDev /> },
      
//       // All other routes redirect to ContactDev
//       { index: true, element: <Navigate to="/contact-dev" replace /> },
//       { path: "shop", element: <Navigate to="/contact-dev" replace /> },
//       { path: "login", element: <Navigate to="/contact-dev" replace /> },
//       { path: "register", element: <Navigate to="/contact-dev" replace /> },
      
//       { 
//         path: "cart", 
//         element: <Navigate to="/contact-dev" replace />
//       },
//       { 
//         path: "adminPanel", 
//         element: <Navigate to="/contact-dev" replace />
//       },
//       { 
//         path: "admin/sellers", 
//         element: <Navigate to="/contact-dev" replace />
//       },
//       { 
//         path: "userHome", 
//         element: <Navigate to="/contact-dev" replace />
//       },
//       { 
//         path: "sellerHome", 
//         element: <Navigate to="/contact-dev" replace />
//       },
//       { 
//         path: "orders", 
//         element: <Navigate to="/contact-dev" replace />
//       },
//       {
//         path: "orders/:id",
//         element: <Navigate to="/contact-dev" replace />
//       },
//       {
//         path: "/product/:id",
//         element: <Navigate to="/contact-dev" replace />
//       },
//       {
//         path: "/seller/products",
//         element: <Navigate to="/contact-dev" replace />
//       },
//       {
//         path: "/seller/products/new",
//         element: <Navigate to="/contact-dev" replace />
//       },
//       {
//         path: "/seller/products/edit/:id",
//         element: <Navigate to="/contact-dev" replace />
//       },
//       {
//         path: "/payment-success",
//         element: <Navigate to="/contact-dev" replace />
//       },
//       {
//         path: "/payment-failed",
//         element: <Navigate to="/contact-dev" replace />
//       },
//       {
//         path: "/profile",
//         element: <Navigate to="/contact-dev" replace />
//       },
//       {
//         path: "track-order/:orderId",
//         element: <Navigate to="/contact-dev" replace />
//       },
//       {
//         path: "seller/orders",
//         element: <Navigate to="/contact-dev" replace />
//       },
//       {
//         path: "/verify-email",
//         element: <Navigate to="/contact-dev" replace />
//       },
//       {
//         path: "/google-auth",
//         element: <Navigate to="/contact-dev" replace />
//       },
//       {
//         path: "/forgot-password",
//         element: <Navigate to="/contact-dev" replace />
//       },
//       {
//         path: "/reset-password",
//         element: <Navigate to="/contact-dev" replace />
//       },
//     ],
//   },
//   {
//     path: "*",
//     element: <Navigate to="/contact-dev" replace />
//   }
// ]);

// export default router;

import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { LandingPage } from "./pages/LandingPage";
import { Feed } from "./pages/Feed";
import  Cart  from "./pages/Cart";
import LoginPage from "./pages/LoginPage";
import Register from "./pages/Register";
import AdminPanel from "./pages/admin/AdminPannel";
import AdminSellers from "./pages/admin/AdminSellers";
import ApprovedWithdrawals from "./pages/admin/ApprovedWithdrawals";
import WithdrawalHistory from "./pages/admin/WithdrawalHistory";
import UserHome from "./pages/user/UserHome";
import SellerHome from "./pages/seller/SellerDashboard";
import SellerCustomers from "./pages/seller/SellerCustomers";
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
import GoogleAuth from './pages/GoogleAuth';
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import VerifyEmail from './pages/VerifyEmail';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SelectRole from "./pages/SelectRole";
import SellerRegister from "./pages/SellerRegister";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      { 
        index: true, 
        element: (
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        )
      },
      { path: "shop", element: <Feed /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <Register /> },
      { path: "seller/register", element: <SellerRegister /> },
      
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
        path: "admin/withdrawals/approved", 
        element: <ProtectedRoute><ApprovedWithdrawals /></ProtectedRoute> 
      },
      { 
        path: "admin/withdrawals/history", 
        element: <ProtectedRoute><WithdrawalHistory /></ProtectedRoute> 
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
        path: "/seller/customers",
        element: <ProtectedRoute><SellerCustomers /></ProtectedRoute>
      },
      {
        path: "/seller/profile",
        element: <ProtectedRoute><Profile /></ProtectedRoute>
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
        path: "/google-auth",
        element: <GoogleAuth />
      },
      {
        path: "/verify-email",
        element: <VerifyEmail />
      },
      
      {
        path: "/select-role",
        element: (
          <ProtectedRoute>
            <SelectRole />
          </ProtectedRoute>
        ),
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

