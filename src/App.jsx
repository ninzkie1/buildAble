import { useLocation, Outlet } from 'react-router-dom';
import NavbarContainer from './components/NavbarContainer';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';

function App() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const hideNavbar = ['/register', '/seller/register', '/contact-dev', '/select-role'].includes(location.pathname);

  return (
    <>
      <AuthProvider>
        <CartProvider>
          {!hideNavbar && <NavbarContainer />}
          <main className={`container mx-auto px-4 ${isLandingPage ? 'pt-0 pb-0' : hideNavbar ? 'pt-0 pb-8' : 'pt-24 pb-8'}`}>
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
          },
          success: {
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
// import React from 'react';
// import NavbarContainer from './components/NavbarContainer';
// import { Outlet, useLocation } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import { CartProvider } from './context/CartContext';
// import { Toaster } from 'react-hot-toast';

// function App() {
//   const location = useLocation();
//   const isLandingPage = location.pathname === '/';
//   const isContactDev = location.pathname === '/contact-dev';

//   return (
//     <>
//       <AuthProvider>
//         <CartProvider>
//           {!isContactDev && <NavbarContainer />}
//           <main className={`${isContactDev ? '' : 'container mx-auto px-4'} ${isLandingPage ? 'pt-0 pb-0' : isContactDev ? '' : 'pt-24 pb-8'}`}>
//             <Outlet />
//           </main>
//         </CartProvider>
//       </AuthProvider>
      
//       <Toaster
//         position="top-center"
//         reverseOrder={false}
//         gutter={8}
//         containerStyle={{
//           top: '50%',
//           transform: 'translateY(-50%)',
//         }}
//         toastOptions={{
//           duration: 2000,
//           className: 'transform transition-all duration-300 ease-in-out',
//           style: {
//             background: '#363636',
//             color: '#fff',
//             padding: '16px',
//             borderRadius: '8px',
//             fontSize: '14px',
//           },
//           success: {
//             iconTheme: {
//               primary: '#fff',
//               secondary: '#22c55e',
//             },
//             style: {
//               background: '#22c55e',
//             },
//           },
//           error: {
//             style: {
//               background: '#ef4444',
//             },
//           },
//         }}
//       />
//     </>
//   );
// }

// export default App;
