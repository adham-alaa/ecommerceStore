import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { Lock, Loader } from "lucide-react";

const CheckoutPage = () => {
    const { user, signup } = useUserStore();
    const { cart, total, subtotal, coupon, clearCart } = useCartStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    // Redirect to cart only if cart is empty and no order was just placed
    useEffect(() => {
        if (cart.length === 0 && !isProcessing && !orderPlaced) {
            navigate("/cart", { replace: true });
        }
    }, [cart.length, isProcessing, orderPlaced, navigate]);

    const savings = subtotal - total;
    const formattedSubtotal = subtotal.toFixed(2);
    const formattedTotal = total.toFixed(2);
    const formattedSavings = savings.toFixed(2);

    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        password: "",
        confirmPassword: "",
        phone: user?.phone || "",
        street: user?.address?.street || "",
        apartment: user?.address?.apartment || "",
        city: user?.address?.city || "",
        governorate: user?.address?.governorate || "",
        postalCode: user?.address?.postalCode || "",
        country: "Egypt",
    });

    // Update form data when user data is loaded
    useEffect(() => {
        if (user) {
            setFormData(prevData => ({
                ...prevData,
                name: user.name || prevData.name,
                email: user.email || prevData.email,
                phone: user.phone || prevData.phone,
                street: user.address?.street || prevData.street,
                apartment: user.address?.apartment || prevData.apartment,
                city: user.address?.city || prevData.city,
                governorate: user.address?.governorate || prevData.governorate,
                postalCode: user.address?.postalCode || prevData.postalCode,
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (!formData.name || !formData.phone) {
            toast.error("Please fill in all required personal information");
            return false;
        }

        if (!user) {
            if (!formData.email) {
                toast.error("Email is required");
                return false;
            }
            if (!formData.password || formData.password.length < 6) {
                toast.error("Password must be at least 6 characters");
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                toast.error("Passwords do not match");
                return false;
            }
        }

        if (!formData.street || !formData.city || !formData.governorate || !formData.postalCode) {
            toast.error("Please fill in all required address fields");
            return false;
        }

        if (cart.length === 0) {
            toast.error("Your cart is empty");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsProcessing(true);

        try {
            // Get email - for logged in users use their account email, for guests use form email
            let userEmail = user?.email || formData.email;

            // Ensure we have an email
            if (!userEmail) {
                toast.error("Email is required");
                setIsProcessing(false);
                return;
            }

            if (!user) {
                const signupData = {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    address: {
                        street: formData.street,
                        apartment: formData.apartment,
                        city: formData.city,
                        governorate: formData.governorate,
                        postalCode: formData.postalCode,
                        country: formData.country,
                    },
                };

                try {
                    await signup(signupData);
                    userEmail = formData.email;
                    // Small delay to ensure cookies are set properly
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (signupError) {
                    // If signup fails, stop the process
                    setIsProcessing(false);
                    return;
                }
            }

            // Create order with customer info
            const orderData = {
                products: cart,
                couponCode: coupon ? coupon.code : null,
                customerInfo: {
                    name: formData.name,
                    email: userEmail,
                    phone: formData.phone,
                    address: {
                        street: formData.street,
                        apartment: formData.apartment,
                        city: formData.city,
                        governorate: formData.governorate,
                        postalCode: formData.postalCode,
                        country: formData.country,
                    },
                },
            };

            const res = await axios.post("/payments/create-order", orderData);

            if (res.data.success) {
                // Save/update user's address and phone for future orders (only if logged in)
                if (user) {
                    try {
                        await axios.put("/auth/profile", {
                            phone: formData.phone,
                            address: {
                                street: formData.street,
                                apartment: formData.apartment,
                                city: formData.city,
                                governorate: formData.governorate,
                                postalCode: formData.postalCode,
                                country: formData.country,
                            }
                        });
                    } catch (updateError) {
                        // Don't fail the order if profile update fails
                        console.error("Failed to update profile:", updateError);
                    }
                }

                // Mark order as placed to prevent redirect to cart
                setOrderPlaced(true);
                const orderId = res.data.orderId;
                const orderNumber = res.data.orderNumber;
                clearCart();
                toast.success("Order placed successfully! Please pay in cash upon delivery.");
                // Use replace to prevent going back to checkout page
                navigate(`/purchase-success?order_id=${orderId}&order_number=${orderNumber}`, { replace: true });
            }
        } catch (error) {
            console.error("Checkout error:", error);
            toast.error(error.response?.data?.message || "Failed to place order");
        } finally {
            setIsProcessing(false);
        }
    };

    // Don't render checkout form if cart is empty
    if (cart.length === 0) {
        return null;
    }

    return (
        <div className='py-8 md:py-16'>
            <div className='mx-auto max-w-7xl px-4 2xl:px-0'>
                <h1 className='text-3xl font-bold text-stone-400 mb-8'>Checkout</h1>

                <div className='grid lg:grid-cols-2 gap-8'>
                    {/* Checkout Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <form onSubmit={handleSubmit} className='space-y-6'>
                            {/* Personal Information */}
                            <div className='bg-gray-800 rounded-lg border border-gray-700 p-6'>
                                <h2 className='text-xl font-semibold text-white mb-4'>Personal Information</h2>
                                <div className='space-y-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-300 mb-2'>
                                            Full Name *
                                        </label>
                                        <input
                                            type='text'
                                            name='name'
                                            value={formData.name}
                                            onChange={handleChange}
                                            className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-stone-400'
                                            required
                                        />
                                    </div>

                                    {!user && (
                                        <div>
                                            <label className='block text-sm font-medium text-gray-300 mb-2'>
                                                Email Address *
                                            </label>
                                            <input
                                                type='email'
                                                name='email'
                                                value={formData.email}
                                                onChange={handleChange}
                                                className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-stone-400'
                                                required
                                            />
                                        </div>
                                    )}

                                    {!user && (
                                        <>
                                            <div>
                                                <label className='block text-sm font-medium text-gray-300 mb-2'>
                                                    Password * (min. 6 characters)
                                                </label>
                                                <input
                                                    type='password'
                                                    name='password'
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-stone-400'
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className='block text-sm font-medium text-gray-300 mb-2'>
                                                    Confirm Password *
                                                </label>
                                                <input
                                                    type='password'
                                                    name='confirmPassword'
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-stone-400'
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <label className='block text-sm font-medium text-gray-300 mb-2'>
                                            Phone Number *
                                        </label>
                                        <input
                                            type='tel'
                                            name='phone'
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder='+20 123 456 7890'
                                            className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-stone-400'
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className='bg-gray-800 rounded-lg border border-gray-700 p-6'>
                                <h2 className='text-xl font-semibold text-white mb-4'>Shipping Address</h2>
                                <div className='space-y-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-300 mb-2'>
                                            Street Address *
                                        </label>
                                        <input
                                            type='text'
                                            name='street'
                                            value={formData.street}
                                            onChange={handleChange}
                                            placeholder='e.g., 123 Main Street'
                                            className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-stone-400'
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className='block text-sm font-medium text-gray-300 mb-2'>
                                            Apartment / Building (Optional)
                                        </label>
                                        <input
                                            type='text'
                                            name='apartment'
                                            value={formData.apartment}
                                            onChange={handleChange}
                                            placeholder='e.g., Apt 4B, Floor 2'
                                            className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-stone-400'
                                        />
                                    </div>

                                    <div className='grid grid-cols-2 gap-4'>
                                        <div>
                                            <label className='block text-sm font-medium text-gray-300 mb-2'>
                                                Governorate *
                                            </label>
                                            <select
                                                name='governorate'
                                                value={formData.governorate}
                                                onChange={handleChange}
                                                className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-stone-400'
                                                required
                                            >
                                                <option value=''>Select Governorate</option>
                                                <option value='Cairo'>Cairo</option>
                                                <option value='Giza'>Giza</option>
                                                <option value='Alexandria'>Alexandria</option>
                                                <option value='Qalyubia'>Qalyubia</option>
                                                <option value='Sharqia'>Sharqia</option>
                                                <option value='Dakahlia'>Dakahlia</option>
                                                <option value='Beheira'>Beheira</option>
                                                <option value='Kafr El Sheikh'>Kafr El Sheikh</option>
                                                <option value='Gharbia'>Gharbia</option>
                                                <option value='Monufia'>Monufia</option>
                                                <option value='Damietta'>Damietta</option>
                                                <option value='Port Said'>Port Said</option>
                                                <option value='Ismailia'>Ismailia</option>
                                                <option value='Suez'>Suez</option>
                                                <option value='North Sinai'>North Sinai</option>
                                                <option value='South Sinai'>South Sinai</option>
                                                <option value='Red Sea'>Red Sea</option>
                                                <option value='Luxor'>Luxor</option>
                                                <option value='Aswan'>Aswan</option>
                                                <option value='Asyut'>Asyut</option>
                                                <option value='Sohag'>Sohag</option>
                                                <option value='Qena'>Qena</option>
                                                <option value='Beni Suef'>Beni Suef</option>
                                                <option value='Fayoum'>Fayoum</option>
                                                <option value='Minya'>Minya</option>
                                                <option value='New Valley'>New Valley</option>
                                                <option value='Matrouh'>Matrouh</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className='block text-sm font-medium text-gray-300 mb-2'>
                                                City *
                                            </label>
                                            <input
                                                type='text'
                                                name='city'
                                                value={formData.city}
                                                onChange={handleChange}
                                                placeholder='e.g., Nasr City'
                                                className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-stone-400'
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className='grid grid-cols-2 gap-4'>
                                        <div>
                                            <label className='block text-sm font-medium text-gray-300 mb-2'>
                                                Postal Code *
                                            </label>
                                            <input
                                                type='text'
                                                name='postalCode'
                                                value={formData.postalCode}
                                                onChange={handleChange}
                                                placeholder='e.g., 11371'
                                                className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-stone-400'
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className='block text-sm font-medium text-gray-300 mb-2'>
                                                Country
                                            </label>
                                            <input
                                                type='text'
                                                name='country'
                                                value={formData.country}
                                                disabled
                                                className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white opacity-50 cursor-not-allowed'
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </motion.div>

                    {/* Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className='bg-gray-800 rounded-lg border border-gray-700 p-6 sticky top-24'>
                            <h2 className='text-xl font-semibold text-stone-400 mb-4'>Order Summary</h2>

                            <div className='space-y-4 mb-6'>
                                {cart.map((item) => (
                                    <div key={item._id} className='flex justify-between items-center py-2 border-b border-gray-700'>
                                        <div className='flex items-center gap-3'>
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className='w-12 h-12 object-cover rounded'
                                            />
                                            <div>
                                                <p className='text-sm text-white'>{item.name}</p>
                                                <p className='text-xs text-gray-400'>Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className='text-sm text-white'>EGP {(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className='space-y-2 mb-6'>
                                <div className='flex justify-between text-gray-300'>
                                    <span>Subtotal</span>
                                    <span>EGP {formattedSubtotal}</span>
                                </div>

                                {savings > 0 && (
                                    <div className='flex justify-between text-stone-400'>
                                        <span>Savings</span>
                                        <span>-EGP {formattedSavings}</span>
                                    </div>
                                )}

                                {coupon && (
                                    <div className='flex justify-between text-stone-400'>
                                        <span>Coupon ({coupon.code})</span>
                                        <span>-{coupon.discountPercentage}%</span>
                                    </div>
                                )}

                                <div className='flex justify-between text-lg font-bold text-white border-t border-gray-700 pt-2'>
                                    <span>Total</span>
                                    <span className='text-stone-400'>EGP {formattedTotal}</span>
                                </div>
                            </div>

                            <div className='rounded-lg bg-blue-900/20 border border-blue-500/30 p-3 mb-6'>
                                <p className='text-sm text-blue-300'>
                                    <span className='font-semibold'>Payment Method:</span> Cash on Delivery
                                </p>
                                <p className='text-xs text-blue-300/70 mt-1'>
                                    Please have the exact amount ready for our delivery personnel.
                                </p>
                            </div>

                            <motion.button
                                type='button'
                                onClick={handleSubmit}
                                disabled={isProcessing}
                                className='w-full bg-stone-500 hover:bg-stone-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors'
                                whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                                whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader className='animate-spin' size={20} />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Lock size={20} />
                                        Confirm Order
                                    </>
                                )}
                            </motion.button>

                            {!user && (
                                <p className='text-xs text-gray-400 text-center mt-4'>
                                    By placing this order, you'll create an account with the provided information.
                                </p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
