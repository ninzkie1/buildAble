import NavbarContainer from './components/NavbarContainer';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <NavbarContainer />
      <main style={{ padding: "2rem" }}>
        <Outlet /> {/* Nested pages render here */}
      </main>
    </AuthProvider>
  );
}

export default App;
