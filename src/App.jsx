import { Outlet } from "react-router-dom";
import Navbar from "./components/navbar";

function App() {
  return (
    <>
      <Navbar />
      <main style={{ padding: "2rem" }}>
        <Outlet />
      </main>
    </>
  );
}

export default App;
