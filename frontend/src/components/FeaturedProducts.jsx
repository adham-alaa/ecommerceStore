import { useEffect, useState } from "react";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { motion } from "framer-motion";
import ProductOptionsModal from "./ProductOptionsModal";

const FeaturedProducts = ({ featuredProducts }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(4);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { addToCart } = useCartStore();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) setItemsPerPage(1);
            else if (window.innerWidth < 1024) setItemsPerPage(2);
            else if (window.innerWidth < 1280) setItemsPerPage(3);
            else setItemsPerPage(4);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => prevIndex + 1);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => Math.max(0, prevIndex - 1));
    };

    const isStartDisabled = currentIndex === 0;
    const isEndDisabled = currentIndex >= featuredProducts.length - itemsPerPage;

    const handleAddToCartClick = (product) => {
        const hasOptions = product.colorVariants?.length > 0;

        if (hasOptions) {
            setSelectedProduct(product);
            setIsModalOpen(true);
        } else {
            addToCart(product);
        }
    };

    // Calculate total stock across all color variants
    const getTotalStock = (product) => {
        if (!product.colorVariants || product.colorVariants.length === 0) {
            return product.stock || 0;
        }
        return product.colorVariants.reduce((total, variant) => {
            const variantStock = variant.sizes.reduce((sum, sizeObj) => sum + (sizeObj.stock || 0), 0);
            return total + variantStock;
        }, 0);
    };

    const handleAddToCart = (options = {}) => {
        addToCart(selectedProduct, options.size, options.color);
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    return (
        <div className='py-12'>
            <div className='container mx-auto px-2 sm:px-4'>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className='text-center text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 sm:mb-8'
                >
                    New Arrivals
                </motion.h2>
                <div className='relative px-2 sm:px-0'>
                    <div className='overflow-hidden'>
                        <div
                            className='flex transition-transform duration-300 ease-in-out'
                            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
                        >
                            {featuredProducts?.map((product, index) => (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                                    className='w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 shrink-0 px-1 sm:px-2'
                                >
                                    <motion.div
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        transition={{ duration: 0.3 }}
                                        className='flex flex-col overflow-hidden rounded-lg border border-gray-200 shadow-lg h-full bg-white'
                                    >
                                        <div className='relative w-full h-60 overflow-hidden rounded-xl bg-gray-100'>
                                            <motion.img
                                                whileHover={{ scale: 1.1 }}
                                                transition={{ duration: 0.4 }}
                                                src={product.image || ""}
                                                alt={product.name || "Product"}
                                                className='w-full h-full object-cover'
                                                onError={(e) => {
                                                    console.log("Featured image failed to load:", product.image);
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                            {/* Stock Badge */}
                                            <div className='absolute top-2 right-2'>
                                                {getTotalStock(product) > 0 ? (
                                                    <span className='bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full'>
                                                        In Stock
                                                    </span>
                                                ) : (
                                                    <span className='bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full'>
                                                        Out of Stock
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className='mt-4 px-5 pb-5 flex flex-col flex-1'>
                                            <h3 className='text-lg font-semibold mb-2 text-gray-900'>{product.name}</h3>
                                            <p className='text-3xl font-bold text-gray-800 mb-4'>
                                                EGP {product.price?.toFixed(2) || "0.00"}
                                            </p>
                                            <motion.button
                                                whileHover={{ scale: getTotalStock(product) > 0 ? 1.05 : 1 }}
                                                whileTap={{ scale: getTotalStock(product) > 0 ? 0.95 : 1 }}
                                                onClick={() => handleAddToCartClick(product)}
                                                disabled={getTotalStock(product) === 0}
                                                className='w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center mt-auto disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50'
                                            >
                                                <ShoppingCart className='w-5 h-5 mr-2' />
                                                {getTotalStock(product) === 0 ? 'Out of Stock' : 'Add to Cart'}
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={prevSlide}
                        disabled={isStartDisabled}
                        className={`absolute top-1/2 left-0 sm:-left-4 transform -translate-y-1/2 p-1.5 sm:p-2 rounded-full transition-colors duration-300 z-10 ${isStartDisabled ? "bg-gray-300 cursor-not-allowed" : "bg-gray-900 hover:bg-gray-700 text-white"
                            }`}
                    >
                        <ChevronLeft className='w-5 h-5 sm:w-6 sm:h-6' />
                    </button>

                    <button
                        onClick={nextSlide}
                        disabled={isEndDisabled}
                        className={`absolute top-1/2 right-0 sm:-right-4 transform -translate-y-1/2 p-1.5 sm:p-2 rounded-full transition-colors duration-300 z-10 ${isEndDisabled ? "bg-gray-300 cursor-not-allowed" : "bg-gray-900 hover:bg-gray-700 text-white"
                            }`}
                    >
                        <ChevronRight className='w-5 h-5 sm:w-6 sm:h-6' />
                    </button>
                </div>
            </div>

            {selectedProduct && (
                <ProductOptionsModal
                    product={selectedProduct}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedProduct(null);
                    }}
                    onAddToCart={handleAddToCart}
                />
            )}
        </div>
    );
};
export default FeaturedProducts;