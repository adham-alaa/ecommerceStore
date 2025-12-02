import { motion } from "framer-motion";
import { Trash, Star } from "lucide-react";
import toast from "react-hot-toast";
import { useProductStore } from "../stores/useProductStore";

const ProductsList = () => {
    const { deleteProduct, toggleFeaturedProduct, products } = useProductStore();

    console.log("products", products);

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

    const handleToggleFeatured = async (productId, isFeatured) => {
        try {
            await toggleFeaturedProduct(productId);
            toast.success(`Product ${isFeatured ? "removed from" : "added to"} featured!`, {
                icon: "⭐",
            });
        } catch (error) {
            toast.error("Failed to update featured status");
        }
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await deleteProduct(productId);
            toast.success("Product deleted successfully!", {
                icon: "🗑️",
            });
        } catch (error) {
            toast.error("Failed to delete product");
        }
    };

    return (
        <motion.div
            className='bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            <div className='overflow-x-auto'>
                <table className=' min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-100'>
                        <tr>
                            <th
                                scope='col'
                                className='px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider'
                            >
                                Product
                            </th>
                            <th
                                scope='col'
                                className='px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider'
                            >
                                Price
                            </th>
                            <th
                                scope='col'
                                className='px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider'
                            >
                                Category
                            </th>
                            <th
                                scope='col'
                                className='px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider'
                            >
                                Stock
                            </th>
                            <th
                                scope='col'
                                className='px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider'
                            >
                                Featured
                            </th>
                            <th
                                scope='col'
                                className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className='bg-white divide-y divide-gray-200'>
                        {products?.map((product) => (
                            <tr key={product._id} className='hover:bg-gray-700'>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='flex items-center'>
                                        <div className='shrink-0 h-10 w-10'>
                                            <img
                                                className='h-10 w-10 rounded-full object-cover'
                                                src={product.image || ""}
                                                alt={product.name || "Product"}
                                            />
                                        </div>
                                        <div className='ml-4'>
                                            <div className='text-sm font-medium text-gray-900'>{product.name || "Unknown"}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-700'>EGP {(product.price || 0).toFixed(2)}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-700'>{product.category || "N/A"}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='flex items-center'>
                                        <span className='text-sm font-medium text-gray-700 mr-2'>
                                            {getTotalStock(product)}
                                        </span>
                                        {getTotalStock(product) > 0 ? (
                                            <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500'>
                                                In Stock
                                            </span>
                                        ) : (
                                            <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500'>
                                                Out of Stock
                                            </span>
                                        )}
                                    </div>
                                    {product.colorVariants && product.colorVariants.length > 0 && (
                                        <div className='text-xs text-gray-400 mt-1'>
                                            {product.colorVariants.map(v => `${v.color}: ${v.sizes.reduce((sum, s) => sum + s.stock, 0)}`).join(', ')}
                                        </div>
                                    )}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <button
                                        onClick={() => handleToggleFeatured(product._id, product.isFeatured)}
                                        className={`p-1 rounded-full ${product.isFeatured ? "bg-yellow-400 text-gray-900" : "bg-gray-600 text-gray-300"
                                            } hover:bg-yellow-500 transition-colors duration-200`}
                                    >
                                        <Star className='h-5 w-5' />
                                    </button>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                                    <button
                                        onClick={() => handleDeleteProduct(product._id)}
                                        className='text-red-400 hover:text-red-300'
                                    >
                                        <Trash className='h-5 w-5' />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};
export default ProductsList;