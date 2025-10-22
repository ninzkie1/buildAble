import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { LandingPage } from "./pages/LandingPage";
import { Feed } from "./pages/Feed";
import  Cart  from "./pages/Cart";
import LoginPage from "./pages/LoginPage";
import Register from "./pages/Register";
import AdminPanel from "./pages/admin/AdminPannel";
import UserHome from "./pages/user/UserHome";
import SellerHome from "./pages/seller/SellerHome";
import OrderHistory from "./pages/user/OrderHistory";
import OrderDetails from './pages/user/OrderDetails';

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
      }
    ],
  },
]);

export default router;
