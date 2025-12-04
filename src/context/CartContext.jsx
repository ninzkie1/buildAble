// src/context/CartContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import config from "../config/config";

const CartContext = createContext();

// ✅ Custom hook for easy access
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Sync cart to backend
  const syncCartToBackend = useCallback(async (cartToSync) => {
    if (!isAuthenticated || !user?.token || syncing) return;

    setSyncing(true);
    try {
      const response = await fetch(`${config.apiUrl}/api/users/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ cart: cartToSync }),
      });

      if (!response.ok) {
        console.error("Failed to sync cart to backend");
      }
    } catch (error) {
      console.error("Error syncing cart:", error);
    } finally {
      setSyncing(false);
    }
  }, [isAuthenticated, user?.token]);

  // Load cart from backend or localStorage
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      // Clear cart immediately when user changes to prevent showing wrong cart
      setCart([]);
      
      try {
        if (isAuthenticated && user?.token && user?._id) {
          // Load from backend
          const response = await fetch(`${config.apiUrl}/api/users/cart`, {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            const backendCart = data.success && data.cart ? data.cart : [];
            
            // Check for guest cart to merge (only if this is first login)
            const guestCart = localStorage.getItem("guestCart");
            let mergedCart = [...backendCart];
            
            if (guestCart) {
              const parsedGuestCart = JSON.parse(guestCart);
              
              // Merge guest cart with backend cart
              parsedGuestCart.forEach((guestItem) => {
                const existingItem = mergedCart.find(
                  (item) => item._id === guestItem._id
                );
                
                if (existingItem) {
                  // Update quantity if guest has more, or keep existing
                  existingItem.quantity = Math.max(
                    existingItem.quantity,
                    guestItem.quantity
                  );
                } else {
                  // Add new item from guest cart
                  mergedCart.push(guestItem);
                }
              });
              
              // Save merged cart to backend
              if (mergedCart.length > 0 && JSON.stringify(mergedCart) !== JSON.stringify(backendCart)) {
                await syncCartToBackend(mergedCart);
              }
              
              // Clear guest cart after merging
              localStorage.removeItem("guestCart");
            }
            
            setCart(mergedCart);
          } else {
            // If backend fails, try to load from localStorage
            const guestCart = localStorage.getItem("guestCart");
            if (guestCart) {
              setCart(JSON.parse(guestCart));
            } else {
              setCart([]);
            }
          }
        } else {
          // Guest user - load from localStorage
          const guestCart = localStorage.getItem("guestCart");
          if (guestCart) {
            setCart(JSON.parse(guestCart));
          } else {
            setCart([]);
          }
        }
      } catch (error) {
        console.error("Error loading cart:", error);
        // Fallback to localStorage
        const guestCart = localStorage.getItem("guestCart");
        if (guestCart) {
          setCart(JSON.parse(guestCart));
        } else {
          setCart([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [isAuthenticated, user?._id, user?.token, syncCartToBackend]);

  // Save cart to localStorage and backend
  useEffect(() => {
    if (loading || syncing) return; // Don't sync while loading or syncing

    // Always save to localStorage as backup (only for guest users or as fallback)
    if (!isAuthenticated) {
      localStorage.setItem("guestCart", JSON.stringify(cart));
    }

    // Sync to backend if user is logged in (debounce to avoid too many requests)
    // Skip syncing if cart is being updated from backend (to avoid loops)
    if (isAuthenticated && user?.token && user?._id && cart.length >= 0 && !syncing) {
      // Use a small delay to batch multiple rapid changes
      const timeoutId = setTimeout(() => {
        if (!syncing && !loading) {
          syncCartToBackend(cart);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [cart, isAuthenticated, user?._id, user?.token, loading, syncing, syncCartToBackend]);

  const addToCart = async (product) => {
    // Optimistic update - update UI immediately for instant feedback
    let optimisticCart;
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);

      if (existingItem) {
        // Check if adding one more would exceed stock
        if (existingItem.quantity >= product.stock) {
          toast.error(`Cannot add more. Only ${product.stock} items available.`);
          return prevCart;
        }
        // Increase quantity if within stock limit
        optimisticCart = prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
        return optimisticCart;
      }

      // Add new item with quantity 1
      optimisticCart = [...prevCart, { ...product, quantity: 1 }];
      return optimisticCart;
    });

    // Sync with backend in the background (for logged-in users)
    if (isAuthenticated && user?.token) {
      // Don't await - let it run in background
      (async () => {
        try {
          const response = await fetch(`${config.apiUrl}/api/users/cart/add`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({
              productId: product._id,
              quantity: 1,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              // Reload cart from backend to ensure sync (only if different)
              const cartResponse = await fetch(`${config.apiUrl}/api/users/cart`, {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                },
              });
              if (cartResponse.ok) {
                const cartData = await cartResponse.json();
                if (cartData.success && Array.isArray(cartData.cart)) {
                  // Only update if cart has changed (to avoid unnecessary re-renders)
                  setCart((currentCart) => {
                    const currentIds = currentCart.map(item => String(item._id)).sort().join(',');
                    const backendIds = cartData.cart.map(item => String(item._id)).sort().join(',');
                    if (currentIds !== backendIds) {
                      return cartData.cart;
                    }
                    return currentCart;
                  });
                }
              }
            }
          } else {
            // If backend fails, revert optimistic update
            const errorData = await response.json();
            console.error("Error adding to cart:", errorData);
            toast.error(errorData.message || "Failed to add to cart");
            // Reload cart from backend to get correct state
            const cartResponse = await fetch(`${config.apiUrl}/api/users/cart`, {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            });
            if (cartResponse.ok) {
              const cartData = await cartResponse.json();
              if (cartData.success) {
                setCart(cartData.cart);
              }
            }
          }
        } catch (error) {
          console.error("Error adding to cart:", error);
          // Reload cart from backend to get correct state
          try {
            const cartResponse = await fetch(`${config.apiUrl}/api/users/cart`, {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            });
            if (cartResponse.ok) {
              const cartData = await cartResponse.json();
              if (cartData.success) {
                setCart(cartData.cart);
              }
            }
          } catch (reloadError) {
            console.error("Error reloading cart:", reloadError);
          }
        }
      })();
    }
  };

  const removeFromCart = async (productId) => {
    if (isAuthenticated && user?.token) {
      try {
        const response = await fetch(`${config.apiUrl}/api/users/cart/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Reload cart from backend
            const cartResponse = await fetch(`${config.apiUrl}/api/users/cart`, {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            });
            if (cartResponse.ok) {
              const cartData = await cartResponse.json();
              if (cartData.success) {
                setCart(cartData.cart);
                return;
              }
            }
          }
        }
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    }

    // Local update
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  };

  const updateQuantity = async (productId, quantity, stock) => {
    if (quantity > stock) {
      toast.error(`Cannot add more than ${stock} items`);
      return;
    }

    if (isAuthenticated && user?.token) {
      try {
        const response = await fetch(`${config.apiUrl}/api/users/cart/${productId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ quantity }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Reload cart from backend
            const cartResponse = await fetch(`${config.apiUrl}/api/users/cart`, {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            });
            if (cartResponse.ok) {
              const cartData = await cartResponse.json();
              if (cartData.success) {
                setCart(cartData.cart);
                return;
              }
            }
          }
        }
      } catch (error) {
        console.error("Error updating cart:", error);
      }
    }

    // Local update
    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === productId
          ? { ...item, quantity: Math.min(Math.max(1, quantity), stock) }
          : item
      )
    );
  };

  const clearCart = async () => {
    if (isAuthenticated && user?.token) {
      try {
        const response = await fetch(`${config.apiUrl}/api/users/cart`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (response.ok) {
          setCart([]);
          return;
        }
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
    }

    // Local update
    setCart([]);
  };

  // Helper function to remove multiple items at once
  const removeMultipleFromCart = async (productIds) => {
    if (!Array.isArray(productIds) || productIds.length === 0) return;

    // Convert all product IDs to strings for consistent comparison
    const productIdsStr = productIds.map(id => String(id));
    console.log('removeMultipleFromCart - Product IDs to remove:', productIdsStr);

    // Update local state immediately for better UX
    setCart((prevCart) => {
      const filtered = prevCart.filter((item) => !productIdsStr.includes(String(item._id)));
      console.log('removeMultipleFromCart - Local update - Previous cart:', prevCart.map(item => String(item._id)));
      console.log('removeMultipleFromCart - Local update - Filtered cart:', filtered.map(item => String(item._id)));
      return filtered;
    });

    if (isAuthenticated && user?.token) {
      // Set syncing flag to prevent sync effect from interfering
      setSyncing(true);
      
      try {
        // Remove items one by one from backend
        for (const productId of productIdsStr) {
          try {
            const response = await fetch(`${config.apiUrl}/api/users/cart/${productId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            });
            
            if (!response.ok) {
              console.error(`Failed to remove ${productId} from backend cart`);
            }
          } catch (error) {
            console.error(`Error removing ${productId} from cart:`, error);
          }
        }
        
        // Small delay to ensure backend has processed all deletions
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Reload cart once after all removals to ensure sync with backend
        try {
          const cartResponse = await fetch(`${config.apiUrl}/api/users/cart`, {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });
          if (cartResponse.ok) {
            const cartData = await cartResponse.json();
            if (cartData.success) {
              console.log('removeMultipleFromCart - Reloaded cart from backend:', cartData.cart.map(item => String(item._id)));
              // Only update if we got a valid cart (not empty due to error)
              if (Array.isArray(cartData.cart)) {
                setCart(cartData.cart);
              }
            }
          }
        } catch (error) {
          console.error("Error reloading cart:", error);
        }
      } finally {
        setSyncing(false);
      }
    }
  };

  // Optional: computed values
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        removeMultipleFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
