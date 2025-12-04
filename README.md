# buildAble Frontend

React-based frontend application for the buildAble e-commerce platform - a construction materials marketplace.

## 🚀 Tech Stack

- **React 19.1.1** - Modern UI library with latest features
- **Vite 7.1.11** - Fast build tool and dev server
- **React Router DOM 7.9.4** - Client-side routing
- **Tailwind CSS 3.4.18** - Utility-first CSS framework
- **Lucide React 0.546.0** - Beautiful icon library
- **React Hot Toast 2.6.0** - Toast notifications
- **React Icons 5.5.0** - Additional icon sets
- **Recharts 3.3.0** - Chart library for analytics
- **WebSocket (ws 8.18.3)** - Real-time communication

## 📁 Project Structure

```
frontend/
├── public/                    # Static assets
│   ├── logo.png
│   ├── hero-bg.png
│   └── ...
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Navbar.jsx        # Main navigation
│   │   ├── NavbarContainer.jsx # Role-based navbar selector
│   │   ├── AdminNavbar.jsx   # Admin navigation
│   │   ├── SellerNavbar.jsx  # Seller navigation
│   │   ├── UserNavbar.jsx    # User navigation
│   │   ├── RiderNavbar.jsx   # Rider navigation
│   │   ├── ProductCard.jsx   # Product display card
│   │   ├── FloatingCart.jsx  # Floating cart widget
│   │   ├── Cart.jsx          # Shopping cart page
│   │   ├── Chat.jsx          # Real-time chat component
│   │   ├── SellerChat.jsx    # Seller chat interface
│   │   ├── AddressModal.jsx  # Address input modal
│   │   ├── PaymentMethodModal.jsx # Payment selection modal
│   │   ├── NotificationDropdown.jsx # Notification dropdown
│   │   ├── RiderNotificationDropdown.jsx # Rider notifications
│   │   ├── ProtectedRoute.jsx # Route protection
│   │   ├── PublicRoute.jsx   # Public route wrapper
│   │   ├── HeroSection.jsx   # Landing page hero
│   │   └── Footer.jsx        # Footer component
│   │
│   ├── pages/                # Page components
│   │   ├── LandingPage.jsx   # Home/landing page
│   │   ├── Feed.jsx          # Product feed/shop
│   │   ├── LoginPage.jsx     # Login page
│   │   ├── Register.jsx      # User registration
│   │   ├── SellerRegister.jsx # Seller registration
│   │   ├── RiderRegister.jsx  # Rider registration
│   │   ├── RiderLogin.jsx     # Rider login
│   │   ├── Cart.jsx          # Shopping cart
│   │   ├── ProductDetails.jsx # Product detail page
│   │   ├── Profile.jsx        # User profile
│   │   ├── PaymentSuccess.jsx # Payment success page
│   │   ├── PaymentFailed.jsx  # Payment failure page
│   │   ├── ForgotPassword.jsx # Password reset request
│   │   ├── ResetPassword.jsx  # Password reset
│   │   ├── VerifyEmail.jsx    # Email verification
│   │   ├── GoogleAuth.jsx     # Google OAuth handler
│   │   ├── SelectRole.jsx     # Role selection
│   │   ├── NotFound.jsx       # 404 page
│   │   │
│   │   ├── admin/            # Admin pages
│   │   │   ├── AdminPannel.jsx # Admin dashboard
│   │   │   ├── AdminSellers.jsx # Seller management
│   │   │   ├── ApprovedWithdrawals.jsx # Withdrawal approvals
│   │   │   └── WithdrawalHistory.jsx # Withdrawal history
│   │   │
│   │   ├── seller/           # Seller pages
│   │   │   ├── SellerDashboard.jsx # Seller dashboard
│   │   │   ├── sellerProducts.jsx # Product management
│   │   │   ├── ProductForm.jsx # Create/edit product
│   │   │   ├── Orders.jsx    # Order management
│   │   │   ├── SellerCustomers.jsx # Customer list
│   │   │   └── DeliveryRiderDashboard.jsx # Delivery dashboard (rider access)
│   │   │
│   │   └── user/             # User pages
│   │       ├── UserHome.jsx   # User dashboard
│   │       ├── OrderHistory.jsx # Order history
│   │       ├── OrderDetails.jsx # Order details
│   │       └── TrackOrder.jsx  # Order tracking
│   │
│   ├── context/              # React Context providers
│   │   ├── AuthContext.jsx   # Authentication state
│   │   └── CartContext.jsx   # Shopping cart state
│   │
│   ├── config/               # Configuration
│   │   └── config.js         # API URLs, WebSocket config
│   │
│   ├── utils/                # Utility functions
│   │   └── helpers.jsx       # Helper functions
│   │
│   ├── router.jsx            # Route definitions
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css             # Global styles
│
├── package.json
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
└── postcss.config.js        # PostCSS configuration
```

## 🛠 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation Steps

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoints**
   
   Edit `src/config/config.js`:
   ```javascript
   const config = {
     // Development
     apiUrl: 'http://localhost:5000',
     wsUrl: 'ws://localhost:5000',
     
     // Production
     // apiUrl: 'https://buildablebackend.onrender.com',
     // wsUrl: 'wss://buildablebackend.onrender.com',
     
     getWebSocketUrl: function(params) {
       // WebSocket URL builder
     }
   };
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (outputs to `dist/`)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## 🎨 Key Features

### 1. Authentication System
- **Email/Password Login**: Traditional authentication
- **Google OAuth**: Social login integration
- **Role-based Access**: Admin, User, Seller, Rider roles
- **Protected Routes**: Route guards for authenticated pages
- **Email Verification**: Account verification flow

### 2. Shopping Cart System
- **Persistent Cart**: Saved to user account in database
- **Guest Cart**: LocalStorage for non-authenticated users
- **Cart Merging**: Guest cart merges on login
- **Optimistic Updates**: Instant UI feedback
- **Group by Seller**: Items organized by seller
- **Multi-checkout**: Checkout individual sellers or all items

### 3. Product Management
- **Product Browsing**: Category filtering, search, sorting
- **Product Details**: Reviews, ratings, seller info
- **Image Optimization**: Cloudinary integration
- **Stock Management**: Real-time stock updates

### 4. Order Management
- **Order Creation**: Multi-seller order support
- **Order Tracking**: Real-time status updates
- **Order History**: Complete order records
- **Payment Integration**: PayMongo payment gateway
- **Transaction Fee**: 2% fee calculation

### 5. Real-time Features
- **WebSocket Chat**: Real-time messaging with sellers
- **Notifications**: Polling-based notification system
- **Order Updates**: Live order status changes

### 6. Role-specific Dashboards
- **User Dashboard**: Product browsing, cart, orders
- **Seller Dashboard**: Analytics, products, orders, earnings
- **Rider Dashboard**: Delivery management, notifications
- **Admin Dashboard**: Platform management, approvals

## 🔧 Configuration

### API Configuration (`src/config/config.js`)

```javascript
const config = {
  // Backend API URL
  apiUrl: 'http://localhost:5000',
  
  // WebSocket URL
  wsUrl: 'ws://localhost:5000',
  
  // WebSocket URL builder
  getWebSocketUrl: function(params) {
    const baseUrl = this.wsUrl.endsWith('/') 
      ? this.wsUrl.slice(0, -1) 
      : this.wsUrl;
    const query = new URLSearchParams({
      userId: params.userId,
      receiverId: params.receiverId,
      orderId: params.orderId
    }).toString();
    return `${baseUrl}/ws?${query}`;
  },
  
  // Connection test helper
  testConnection: async function() {
    try {
      const response = await fetch(`${this.apiUrl}/api/health`);
      if (!response.ok) throw new Error('API health check failed');
      return true;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }
};
```

### Tailwind Configuration

The project uses Tailwind CSS with custom configuration. Key features:
- Custom color scheme (buildAble brand colors)
- Responsive breakpoints
- Custom utilities

## 🎯 Key Components

### Context Providers

#### AuthContext
- Manages user authentication state
- Handles login, logout, registration
- Provides user data to components
- Token management

#### CartContext
- Manages shopping cart state
- Handles add/remove/update operations
- Syncs with backend for logged-in users
- Guest cart support via LocalStorage
- Optimistic UI updates

### Route Protection

#### ProtectedRoute
- Wraps routes requiring authentication
- Redirects to login if not authenticated
- Preserves intended destination

#### PublicRoute
- Wraps public routes
- Redirects authenticated users away

### Navigation System

#### NavbarContainer
- Role-based navbar selection
- Renders appropriate navbar based on user role
- Handles logout functionality

## 🚀 Development Workflow

### Adding a New Page

1. Create component in `src/pages/`
2. Add route in `src/router.jsx`
3. Add navigation link if needed
4. Implement role-based access if required

### Adding a New Component

1. Create component in `src/components/`
2. Export component
3. Import and use in pages

### Styling Guidelines

- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Use responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Maintain consistent spacing and colors

### State Management

- **Local State**: Use `useState` for component-specific state
- **Global State**: Use Context API (AuthContext, CartContext)
- **Server State**: Fetch directly in components or use custom hooks

## 🔐 Authentication Flow

1. User logs in via `LoginPage`
2. Token stored in `localStorage`
3. `AuthContext` updates with user data
4. `ProtectedRoute` checks authentication
5. User redirected to appropriate dashboard based on role

## 🛒 Cart Flow

1. User adds item to cart
2. `CartContext` updates immediately (optimistic update)
3. For logged-in users: Sync with backend
4. For guests: Save to LocalStorage
5. Cart persists across sessions
6. On login: Guest cart merges with account cart

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: Default (< 640px)
- **Tablet**: `sm:` (≥ 640px)
- **Desktop**: `md:` (≥ 768px)
- **Large Desktop**: `lg:` (≥ 1024px)

## 🎨 UI/UX Features

- **Toast Notifications**: User feedback via react-hot-toast
- **Loading States**: Spinner components during data fetching
- **Error Handling**: User-friendly error messages
- **Optimistic Updates**: Instant UI feedback
- **Image Optimization**: Cloudinary integration for fast loading
- **Floating Cart**: Quick cart access widget

## 🔄 Real-time Features

### WebSocket Chat
- Real-time messaging between users and sellers
- Order-specific chat threads
- Connection management
- Message persistence

### Notifications
- Polling-based notification system
- 30-second update intervals
- Unread count badges
- Notification dropdowns

## 📦 Build & Deployment

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Deployment (Vercel)

1. Connect GitHub repository
2. Set root directory to `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variables (if needed)
6. Deploy

### Environment Variables

Update `src/config/config.js` for production:
```javascript
apiUrl: 'https://your-backend-url.onrender.com',
wsUrl: 'wss://your-backend-url.onrender.com',
```

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check `config.js` API URL
   - Verify backend is running
   - Check CORS settings

2. **WebSocket Connection Failed**
   - Verify WebSocket URL in config
   - Check backend WebSocket server
   - Check network/firewall settings

3. **Build Errors**
   - Clear `node_modules` and reinstall
   - Check Node.js version (v18+)
   - Verify all dependencies installed

4. **Routing Issues**
   - Check route definitions in `router.jsx`
   - Verify ProtectedRoute/PublicRoute usage
   - Check authentication state

## 📚 Dependencies

### Core Dependencies
- `react` & `react-dom` - UI framework
- `react-router-dom` - Routing
- `vite` - Build tool

### UI Libraries
- `tailwindcss` - CSS framework
- `lucide-react` - Icons
- `react-icons` - Additional icons
- `recharts` - Charts

### Utilities
- `react-hot-toast` - Notifications
- `ws` - WebSocket client

## 🔗 Related Documentation

- [Main Project README](../README.md) - Full project documentation
- [Backend Documentation](../backend/README.md) - Backend API docs

## 📝 Notes

- Uses React 19 with latest features
- Vite for fast development and builds
- Tailwind CSS for styling
- Context API for state management
- WebSocket for real-time features
- Optimistic UI updates for better UX

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure API endpoints in `src/config/config.js`
4. Start dev server: `npm run dev`
5. Open `http://localhost:5173`

---

**Version**: 1.0.0  
**Last Updated**: January 2025
