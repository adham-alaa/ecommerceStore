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
        <div className='relative min-h-screen text-black overflow-hidden'>
            {/* Hero Section */}
            <div className='relative z-10  pb-12'>
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
                            className='text-6xl sm:text-7xl md:text-8xl font-bold mb-6 bg-linear-to-r from-gray-800 via-gray-900 to-gray-700 bg-clip-text text-transparent font-canela'
                        >
                            <img
                                src="/SYNZABLACK.png"
                                alt="SYNZA Logo"
                                className=" mx-auto w-64 sm:w-80 md:w-96"
                            />
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                            className='text-xl sm:text-2xl md:text-3xl text-gray-700 font-light tracking-wide font-canela'
                        >
                            Distinctive. sophisticated. Bold.
                        </motion.p>
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                            className='mt-8 h-1 w-32 mx-auto bg-linear-to-r from-transparent via-gray-600 to-transparent'
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
                                    src='/HomePage.png'
                                    alt='Home Page Hero'
                                    className='w-full h-auto object-cover'
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
                                className='text-4xl sm:text-5xl font-bold text-gray-900 font-canela'
                            >
                                Where Luxury Begins with the Touch
                            </motion.h2>

                            <motion.div
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className='h-1 w-24 bg-linear-to-r from-gray-600 to-gray-800'
                            />

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className='text-lg text-gray-700 leading-relaxed'
                            >
                                Our Story
                                At SYNZA, we believe that true elegance is defined by more than just appearance—it's defined by what you feel against your skin.

                                We are curators of sophisticated fashion, born from a vision to create a brand that embodies the essence of timeless quality and determination.

                                Every SYNZA garment is a promise of luxury, crafted from premium, heavyweight fabrics chosen for their impeccable drape and durability. We reject fast-fashion, focusing on meticulous craftsmanship where every detail is obsessed over.

                            </motion.p>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                                className='text-lg text-gray-700 leading-relaxed'
                            >
                                Designed by a passionate team of Egyptian artisans and designers, SYNZA offers modern elegance for the woman who seeks to feel confident, comfortable, and undeniably luxurious.

                                Experience the difference of true quality. Experience SYNZA.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.7 }}
                                className='flex gap-4 pt-4'
                            >

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