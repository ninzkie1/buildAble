import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { LandingPage } from "./pages/LandingPage";
import { Feed } from "./pages/Feed";
import  Cart  from "./pages/Cart";
import LoginPage from "./pages/LoginPage";
import Register from "./pages/Register";
import AdminPanel from "./pages/admin/AdminPannel";
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "shop", element: <Feed /> },
      { path: "cart", element: <Cart /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <Register /> },
      { path: "adminPanel", element: <AdminPanel /> },
      { path: "userHome", element: <UserHome /> },
      { path: "sellerHome", element: <SellerHome /> },
      { 
        path: "orders", 
        element: <OrderHistory /> 
      },
      {
        path: "orders/:id",
        element: <OrderDetails />
      },
      {
        path: "/product/:id",
        element: <ProductDetails />
      },
      {
        path: "/seller/products",
        element: <SellerProducts/>
      },
      {
        path: "/seller/products/new",
        element: <ProductForm />
      },
      {
        path: "/seller/products/edit/:id",
        element: <ProductForm />
      },
      {
        path: "/payment-success",
        element: <PaymentSuccess />,
      },
      {
        path: "/payment-failed",
        element: <PaymentFailed />,
      },
      {
        path: "/profile",
        element: <Profile/>
      },
      {
        path: "track-order/:orderId",
        element: <TrackOrder />
      },
      {
        path: "seller/orders",
        element: <SellerOrders />
      }
    ],
  },
]);

export default router;
