import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OrderItem } from "@workspace/api-client-react";

interface AppState {
  cart: OrderItem[];
  addToCart: (item: OrderItem, restaurantId: number, restaurantName: string) => void;
  removeFromCart: (menuItemId: number) => void;
  clearCart: () => void;
  cartRestaurantId: number | null;
  cartRestaurantName: string | null;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      cart: [],
      cartRestaurantId: null,
      cartRestaurantName: null,
      addToCart: (item, resId, resName) =>
        set((state) => {
          const isDifferentRestaurant = state.cartRestaurantId !== null && state.cartRestaurantId !== resId;
          const currentCart = isDifferentRestaurant ? [] : state.cart;

          const existing = currentCart.find((i) => i.menuItemId === item.menuItemId);
          if (existing) {
            return {
              cartRestaurantId: resId,
              cartRestaurantName: resName,
              cart: currentCart.map((i) =>
                i.menuItemId === item.menuItemId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return {
            cartRestaurantId: resId,
            cartRestaurantName: resName,
            cart: [...currentCart, item]
          };
        }),
      removeFromCart: (menuItemId) =>
        set((state) => {
          const newCart = state.cart.filter((i) => i.menuItemId !== menuItemId);
          return {
            cart: newCart,
            ...(newCart.length === 0 ? { cartRestaurantId: null, cartRestaurantName: null } : {})
          }
        }),
      clearCart: () => set({ cart: [], cartRestaurantId: null, cartRestaurantName: null }),
    }),
    {
      name: "bytebite-storage",
    }
  )
);
