import { useEffect } from "react";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";
import { motion } from "framer-motion";

const HomePage = () => {
    const { fetchFeaturedProducts, products, loading } = useProductStore();

    useEffect(() => {
        fetchFeaturedProducts();
    }, [fetchFeaturedProducts]);

    return (
        <div className='relative min-h-screen text-white overflow-hidden'>
            {/* Hero Section */}
            <div className='relative z-10 pt-20 pb-16'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className='text-center'
                    >
                        <motion.h1
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                            className='text-6xl sm:text-7xl md:text-8xl font-bold mb-6 bg-linear-to-r from-stone-200 via-stone-100 to-stone-300 bg-clip-text text-transparent'
                        >
                            STORE
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                            className='text-xl sm:text-2xl md:text-3xl text-stone-300 font-light tracking-wide'
                        >
                            Level up your style
                        </motion.p>
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                            className='mt-8 h-1 w-32 mx-auto bg-linear-to-r from-transparent via-stone-400 to-transparent'
                        />
                    </motion.div>
                </div>
            </div>

            {/* About Section */}
            <div className='relative z-10 py-20'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='grid md:grid-cols-2 gap-12 items-center'>
                        {/* Image Side */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className='relative'
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.4 }}
                                className='relative rounded-2xl overflow-hidden shadow-2xl'
                            >
                                <img
                                    src='/hangers-1850082_1920.jpg'
                                    alt='Fashion hangers'
                                    className='w-full h-[500px] object-cover'
                                />
                                <div className='absolute inset-0 bg-linear-to-t from-gray-900/50 to-transparent' />
                            </motion.div>
                        </motion.div>

                        {/* Text Side */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            className='space-y-6'
                        >
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className='text-4xl sm:text-5xl font-bold text-stone-200'
                            >
                                Elevate Your Wardrobe
                            </motion.h2>

                            <motion.div
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className='h-1 w-24 bg-linear-to-r from-stone-400 to-stone-600'
                            />

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className='text-lg text-stone-300 leading-relaxed'
                            >
                                Discover a curated collection of premium clothing that defines modern elegance.
                                From timeless classics to contemporary trends, we bring you quality pieces that
                                speak to your unique style.
                            </motion.p>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                                className='text-lg text-stone-300 leading-relaxed'
                            >
                                Every item is carefully selected to ensure exceptional quality and style.
                                Whether you're dressing for success or expressing your creativity, we've got
                                the perfect pieces to complete your look.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.7 }}
                                className='flex gap-4 pt-4'
                            >
                                <div className='text-center'>
                                    <div className='text-3xl font-bold text-stone-300'>500+</div>
                                    <div className='text-sm text-stone-400'>Premium Items</div>
                                </div>
                                <div className='w-px bg-stone-700' />
                                <div className='text-center'>
                                    <div className='text-3xl font-bold text-stone-300'>5000+</div>
                                    <div className='text-sm text-stone-400'>Happy Customers</div>
                                </div>
                                <div className='w-px bg-stone-700' />
                                <div className='text-center'>
                                    <div className='text-3xl font-bold text-stone-300'>100%</div>
                                    <div className='text-sm text-stone-400'>Quality Assured</div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Featured Products */}
            <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
                {!loading && products && products.length > 0 && <FeaturedProducts featuredProducts={products} />}
            </div>
        </div>
    );
};
export default HomePage;