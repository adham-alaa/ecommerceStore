import { ShoppingCart } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { useState } from "react";
import ProductOptionsModal from "./ProductOptionsModal";

const ProductCard = ({ product }) => {
    const { addToCart } = useCartStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddToCart = (options = {}) => {
        addToCart(product, options.size, options.color);
        setIsModalOpen(false);
    };

    const handleAddToCartClick = () => {
        const hasOptions = product.colorVariants?.length > 0;

        if (hasOptions) {
            setIsModalOpen(true);
        } else {
            handleAddToCart();
        }
    };

    // Calculate total stock across all color variants
    const getTotalStock = () => {
        if (!product.colorVariants || product.colorVariants.length === 0) {
            return product.stock || 0;
        }
        return product.colorVariants.reduce((total, variant) => {
            const variantStock = variant.sizes.reduce((sum, sizeObj) => sum + (sizeObj.stock || 0), 0);
            return total + variantStock;
        }, 0);
    };

    const totalStock = getTotalStock();

    return (
        <div className='flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg'>
            <div className='relative w-full h-60 overflow-hidden rounded-xl bg-gray-900'>
                <img
                    className='w-full h-full object-cover'
                    src={product.image || ""}
                    alt={product.name || 'product image'}
                    onError={(e) => {
                        console.log("Image failed to load:", product.image);
                        e.target.style.display = 'none';
                    }}
                />
                <div className='absolute inset-0  bg-opacity-20' />
                {/* Stock Badge */}
                <div className='absolute top-2 right-2'>
                    {totalStock > 0 ? (
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

            <div className='mt-4 px-5 pb-5'>
                <h5 className='text-xl font-semibold tracking-tight text-white'>{product.name}</h5>
                <div className='mt-2 mb-5 flex items-center justify-between'>
                    <p>
                        <span className='text-3xl font-bold text-stone-400'>EGP {product.price}</span>
                    </p>
                </div>
                <button
                    className='flex items-center justify-center rounded-lg bg-stone-500 px-5 py-2.5 text-center text-sm font-medium
					 text-white hover:bg-stone-600 focus:outline-none focus:ring-4 focus:ring-stone-300 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50'
                    onClick={handleAddToCartClick}
                    disabled={totalStock === 0}
                >
                    <ShoppingCart size={22} className='mr-2' />
                    {totalStock === 0 ? 'Out of Stock' : 'Add to cart'}
                </button>
            </div>

            <ProductOptionsModal
                product={product}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddToCart={handleAddToCart}
            />
        </div>
    );
};
export default ProductCard;