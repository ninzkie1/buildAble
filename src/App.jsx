import NavbarContainer from './components/NavbarContainer';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <AuthProvider>
        <CartProvider>
          <NavbarContainer />
          <main className="container mx-auto px-4 pt-24 pb-8">
            <Outlet />
          </main>
        </CartProvider>
      </AuthProvider>
      
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: '50%',
          transform: 'translateY(-50%)',
        }}
        toastOptions={{
          duration: 2000,
          className: 'transform transition-all duration-300 ease-in-out',
          style: {
            background: '#363636',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#fff',
              secondary: '#22c55e',
            },
            style: {
              background: '#22c55e',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </>
  );
}

export default App;
