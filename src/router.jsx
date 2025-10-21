import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { LandingPage } from "./pages/LandingPage";
import { Feed } from "./pages/Feed";
import { Cart } from "./pages/Cart";
import { LoginPage } from "./pages/LoginPage";
import { Register } from "./pages/Register";


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
    ],
  },
]);

export default router;
