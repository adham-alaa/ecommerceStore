import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
    cart: [],
    coupon: null,
    total: 0,
    subtotal: 0,
    isCouponApplied: false,

    // Load cart from localStorage on init
    loadCartFromLocalStorage: () => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const cart = JSON.parse(savedCart);
                set({ cart: Array.isArray(cart) ? cart : [] });
                get().calculateTotals();
            } catch (error) {
                console.error("Error loading cart from localStorage:", error);
                set({ cart: [] });
            }
        }
    },

    // Save cart to localStorage
    saveCartToLocalStorage: (cart) => {
        localStorage.setItem('cart', JSON.stringify(cart));
    },

    getMyCoupon: async () => {
        try {
            const response = await axios.get("/coupons");
            // getCoupon now returns an array of active coupons, not a single coupon
            // Don't set coupon here as it should only be set when user applies one
        } catch (error) {
            // Silently fail for unauthenticated users
            if (error.response?.status !== 401) {
                console.error("Error fetching coupon:", error);
            }
        }
    },
    applyCoupon: async (code) => {
        try {
            const response = await axios.post("/coupons/validate", { code });
            set({ coupon: response.data, isCouponApplied: true });
            get().calculateTotals();
            toast.success("Coupon applied successfully");
        } catch (error) {
            toast.error("failed to apply coupon");
        }
    },
    removeCoupon: () => {
        set({ coupon: null, isCouponApplied: false });
        get().calculateTotals();
        toast.success("Coupon removed");
    },

    getCartItems: async () => {
        try {
            const res = await axios.get("/cart");
            const cartData = Array.isArray(res.data) ? res.data : [];
            set({ cart: cartData });
            get().calculateTotals();
            get().saveCartToLocalStorage(cartData);
        } catch (error) {
            // If user is not authenticated, load from localStorage
            get().loadCartFromLocalStorage();
            console.error("Error fetching cart:", error);
        }
    },
    clearCart: async () => {
        set({ cart: [], coupon: null, total: 0, subtotal: 0 });
        localStorage.removeItem('cart');
    },
    addToCart: async (product, size, color) => {
        try {
            // Try to add to backend if user is authenticated
            await axios.post("/cart", { productId: product._id, size, color });
            toast.success("Product added to cart");

            set((prevState) => {
                const existingItem = prevState.cart.find((item) =>
                    item._id === product._id && item.size === size && item.color === color
                );
                const newCart = existingItem
                    ? prevState.cart.map((item) =>
                        item._id === product._id && item.size === size && item.color === color
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    )
                    : [...prevState.cart, { ...product, quantity: 1, size, color }];
                get().saveCartToLocalStorage(newCart);
                return { cart: newCart };
            });
            get().calculateTotals();
        } catch (error) {
            // If not authenticated, add to localStorage only
            if (error.response?.status === 401) {
                set((prevState) => {
                    const existingItem = prevState.cart.find((item) =>
                        item._id === product._id && item.size === size && item.color === color
                    );
                    const newCart = existingItem
                        ? prevState.cart.map((item) =>
                            item._id === product._id && item.size === size && item.color === color
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        )
                        : [...prevState.cart, { ...product, quantity: 1, size, color }];
                    get().saveCartToLocalStorage(newCart);
                    return { cart: newCart };
                });
                get().calculateTotals();
                toast.success("Product added to cart");
            } else {
                toast.error(error.response?.data?.message || "An error occurred");
            }
        }
    },
    removeFromCart: async (productId) => {
        try {
            await axios.delete(`/cart`, { data: { productId } });
        } catch (error) {
            // Continue even if backend call fails (for guest users)
        }
        set((prevState) => {
            const newCart = prevState.cart.filter((item) => item._id !== productId);
            get().saveCartToLocalStorage(newCart);
            return { cart: newCart };
        });
        get().calculateTotals();
    },
    updateQuantity: async (productId, quantity) => {
        if (quantity === 0) {
            get().removeFromCart(productId);
            return;
        }

        try {
            await axios.put(`/cart/${productId}`, { quantity });
        } catch (error) {
            // Continue even if backend call fails (for guest users)
        }
        set((prevState) => {
            const newCart = prevState.cart.map((item) => (item._id === productId ? { ...item, quantity } : item));
            get().saveCartToLocalStorage(newCart);
            return { cart: newCart };
        });
        get().calculateTotals();
    },
    calculateTotals: () => {
        const { cart, coupon } = get();
        const subtotal = Array.isArray(cart) ? cart.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0;
        let total = subtotal;

        if (coupon) {
            const discount = subtotal * (coupon.discountPercentage / 100);
            total = subtotal - discount;
        }

        set({ subtotal, total });
    },
}));