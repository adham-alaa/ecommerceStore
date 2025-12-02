import { Minus, Plus, Trash } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";

const CartItem = ({ item }) => {
    const { removeFromCart, updateQuantity } = useCartStore();

    return (
        <div className='rounded-lg border p-4 shadow-sm border-gray-200 bg-white md:p-6'>
            <div className='space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0'>
                <div className='shrink-0 md:order-1'>
                    <img className='h-20 md:h-32 rounded object-cover' src={item.image} />
                </div>
                <label className='sr-only'>Choose quantity:</label>

                <div className='flex items-center justify-between md:order-3 md:justify-end'>
                    <div className='flex items-center gap-2'>
                        <button
                            className='inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border
							 border-gray-300 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2
							  focus:ring-gray-400'
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        >
                            <Minus className='text-gray-700' />
                        </button>
                        <p className='text-gray-900'>{item.quantity}</p>
                        <button
                            className='inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border
							 border-gray-300 bg-gray-100 hover:bg-gray-200 focus:outline-none 
						focus:ring-2 focus:ring-gray-400'
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        >
                            <Plus className='text-gray-700' />
                        </button>
                    </div>

                    <div className='text-end md:order-4 md:w-32'>
                        <p className='text-base font-bold text-gray-900'>EGP {item.price}</p>
                    </div>
                </div>

                <div className='w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md'>
                    <p className='text-base font-medium text-gray-900 hover:text-gray-700 hover:underline'>
                        {item.name}
                    </p>
                    <p className='text-sm text-gray-700'>{item.description}</p>

                    {/* Display selected size and color */}
                    <div className='flex flex-wrap gap-2'>
                        {item.size && (
                            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300'>
                                Size: {item.size}
                            </span>
                        )}
                        {item.color && (
                            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-300'>
                                Color: {item.color}
                            </span>
                        )}
                    </div>

                    <div className='flex items-center gap-4'>
                        <button
                            className='inline-flex items-center text-sm font-medium text-red-600
							 hover:text-red-700 hover:underline'
                            onClick={() => removeFromCart(item._id)}
                        >
                            <Trash />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CartItem;