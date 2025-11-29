import { X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ProductOptionsModal = ({ product, isOpen, onClose, onAddToCart }) => {
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");

    const selectedColorVariant = product.colorVariants?.find(v => v.color === selectedColor);
    const displayImage = selectedColorVariant?.image || product.image;
    const availableSizes = selectedColorVariant?.sizes || [];

    const handleAddToCart = () => {
        if (product.colorVariants?.length > 0 && !selectedColor) {
            return; // Color is required if product has color variants
        }
        if (selectedColorVariant && !selectedSize) {
            return; // Size is required once color is selected
        }

        onAddToCart({
            size: selectedSize,
            color: selectedColor
        });

        // Reset selections
        setSelectedSize("");
        setSelectedColor("");
    };

    const hasOptions = (product.colorVariants?.length > 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className='fixed inset-0 bg-black bg-opacity-50 z-100'
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className='fixed inset-0 z-100 flex items-center justify-center p-4 pt-20'
                    >
                        <div className='bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto pb-10'>
                            {/* Header */}
                            <div className='flex items-center justify-between mb-4'>
                                <h3 className='text-xl font-semibold text-white'>
                                    Select Options
                                </h3>
                                <button
                                    onClick={onClose}
                                    className='text-gray-400 hover:text-white transition-colors'
                                >
                                    <X className='h-6 w-6' />
                                </button>
                            </div>

                            {/* Product Image */}
                            <div className='mb-4'>
                                <img
                                    src={displayImage}
                                    alt={product.name}
                                    className='w-full h-80 object-contain rounded-lg bg-gray-900'
                                />
                            </div>

                            {/* Product Info */}
                            <div className='mb-6'>
                                <p className='text-gray-300 font-medium'>{product.name}</p>
                                <p className='text-stone-400 font-bold'>EGP {product.price}</p>
                            </div>

                            {!hasOptions ? (
                                <p className='text-gray-400 text-sm mb-6'>
                                    This product has no options to select.
                                </p>
                            ) : (
                                <>
                                    {/* Color Selection */}
                                    {product.colorVariants?.length > 0 && (
                                        <div className='mb-6'>
                                            <label className='block text-sm font-medium text-gray-300 mb-2'>
                                                Select Color *
                                            </label>
                                            <div className='flex flex-wrap gap-2'>
                                                {product.colorVariants.map((variant) => (
                                                    <button
                                                        key={variant.color}
                                                        type='button'
                                                        onClick={() => {
                                                            setSelectedColor(variant.color);
                                                            setSelectedSize(""); // Reset size when color changes
                                                        }}
                                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedColor === variant.color
                                                            ? 'bg-stone-500 text-white'
                                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                            }`}
                                                    >
                                                        {variant.color}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Size Selection - only shown after color is selected */}
                                    {selectedColorVariant && availableSizes.length > 0 && (
                                        <div className='mb-6'>
                                            <label className='block text-sm font-medium text-gray-300 mb-2'>
                                                Select Size *
                                            </label>
                                            <div className='flex flex-wrap gap-2'>
                                                {availableSizes.map((sizeObj) => {
                                                    const isOutOfStock = sizeObj.stock === 0;
                                                    return (
                                                        <button
                                                            key={sizeObj.size}
                                                            type='button'
                                                            onClick={() => !isOutOfStock && setSelectedSize(sizeObj.size)}
                                                            disabled={isOutOfStock}
                                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedSize === sizeObj.size
                                                                ? 'bg-stone-500 text-white'
                                                                : isOutOfStock
                                                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed line-through'
                                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                                }`}
                                                        >
                                                            {sizeObj.size} {isOutOfStock && '(Out)'}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Action Buttons */}
                            <div className='flex gap-3'>
                                <button
                                    onClick={onClose}
                                    className='flex-1 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors'
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={
                                        (product.colorVariants?.length > 0 && !selectedColor) ||
                                        (selectedColorVariant && !selectedSize)
                                    }
                                    className='flex-1 px-4 py-2 bg-stone-500 text-white rounded-md hover:bg-stone-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ProductOptionsModal;
