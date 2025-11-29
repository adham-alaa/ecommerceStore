import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link, useNavigate } from "react-router-dom";
import { MoveRight } from "lucide-react";

const OrderSummary = () => {
    const { total, subtotal, coupon, isCouponApplied } = useCartStore();
    const navigate = useNavigate();

    const savings = subtotal - total;
    const formattedSubtotal = subtotal.toFixed(2);
    const formattedTotal = total.toFixed(2);
    const formattedSavings = savings.toFixed(2);

    const handleProceedToCheckout = () => {
        navigate("/checkout");
    };

    return (
        <motion.div
            className='space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <p className='text-xl font-semibold text-stone-400'>Order summary</p>

            <div className='space-y-4'>
                <div className='space-y-2'>
                    <dl className='flex items-center justify-between gap-4'>
                        <dt className='text-base font-normal text-gray-300'>Original price</dt>
                        <dd className='text-base font-medium text-white'>EGP {formattedSubtotal}</dd>
                    </dl>

                    {savings > 0 && (
                        <dl className='flex items-center justify-between gap-4'>
                            <dt className='text-base font-normal text-gray-300'>Savings</dt>
                            <dd className='text-base font-medium text-stone-400'>-EGP {formattedSavings}</dd>
                        </dl>
                    )}

                    {coupon && isCouponApplied && (
                        <dl className='flex items-center justify-between gap-4'>
                            <dt className='text-base font-normal text-gray-300'>Coupon ({coupon.code})</dt>
                            <dd className='text-base font-medium text-stone-400'>-{coupon.discountPercentage}%</dd>
                        </dl>
                    )}
                    <dl className='flex items-center justify-between gap-4 border-t border-gray-600 pt-2'>
                        <dt className='text-base font-bold text-white'>Total</dt>
                        <dd className='text-base font-bold text-stone-400'>EGP {formattedTotal}</dd>
                    </dl>
                </div>

                <div className='space-y-3'>
                    <div className='rounded-lg bg-blue-900/20 border border-blue-500/30 p-3'>
                        <p className='text-sm text-blue-300'>
                            <span className='font-semibold'>Payment Method:</span> Cash on Delivery
                        </p>
                        <p className='text-xs text-blue-300/70 mt-1'>
                            Please have the exact amount ready for our delivery personnel.
                        </p>
                    </div>

                    <motion.button
                        className='flex w-full items-center justify-center rounded-lg bg-stone-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-600 focus:outline-none focus:ring-4 focus:ring-stone-300'
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleProceedToCheckout}
                    >
                        Proceed to Checkout
                    </motion.button>

                    <div className='flex items-center justify-center gap-2'>
                        <span className='text-sm font-normal text-gray-400'>or</span>
                        <Link
                            to='/'
                            className='inline-flex items-center gap-2 text-sm font-medium text-stone-400 underline hover:text-stone-300 hover:no-underline'
                        >
                            Continue Shopping
                            <MoveRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
export default OrderSummary;