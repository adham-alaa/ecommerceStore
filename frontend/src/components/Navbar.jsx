import { ShoppingCart, UserPlus, LogIn, LogOut, Lock, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useState, useEffect } from "react";
import axios from "../lib/axios";

const Navbar = () => {
    const { user, logout } = useUserStore();
    const isAdmin = user?.role === "admin";
    const { cart } = useCartStore();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("/categories");
                setCategories(response.data.categories || []);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    return (
        <header className='fixed top-0 left-0 w-full bg-white bg-opacity-95 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-gray-200'>
            <div className='container mx-auto px-2 sm:px-4 py-2 sm:py-3'>
                <div className='flex justify-between items-center gap-2'>
                    <Link to='/' className='text-lg sm:text-2xl font-bold text-gray-900 flex items-center shrink-0'>
                        HomePage
                    </Link>

                    <nav className='flex items-center gap-1 sm:gap-4'>


                        <div className='relative group'>
                            <button
                                className='flex items-center gap-1 text-gray-700 hover:text-gray-900 transition duration-300 ease-in-out'
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                Categories
                                <ChevronDown size={16} className='group-hover:text-gray-900' />
                            </button>
                            {dropdownOpen && (
                                <div className='absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50'>
                                    {categories.length > 0 ? (
                                        categories.map((category) => (
                                            <Link
                                                key={category._id}
                                                to={`/category/${category.slug}`}
                                                className='block px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition duration-300'
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                {category.name}
                                            </Link>
                                        ))
                                    ) : (
                                        <div className='px-4 py-2 text-gray-400 text-sm'>
                                            No categories available
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <Link
                            to={"/cart"}
                            className='relative group text-gray-700 hover:text-gray-900 transition duration-300 
							ease-in-out px-2 py-1'
                        >
                            <ShoppingCart className='inline-block group-hover:text-gray-900' size={18} />
                            {cart.length > 0 && (
                                <span
                                    className='absolute -top-1 -right-1 bg-gray-900 text-white rounded-full w-5 h-5 flex items-center justify-center
									text-xs group-hover:bg-gray-700 transition duration-300 ease-in-out'
                                >
                                    {cart.length}
                                </span>
                            )}
                        </Link>

                        {isAdmin && (
                            <Link
                                className='bg-stone-500 hover:bg-stone-600 text-white px-3 py-2 rounded-md font-medium
								 transition duration-300 ease-in-out flex items-center gap-1'
                                to={'/secret-dashboard'}
                            >
                                <Lock size={18} />
                                <span className='hidden sm:inline'>Dashboard</span>
                            </Link>
                        )}

                        {user ? (
                            <button
                                className='bg-red-500 hover:bg-red-600 text-white px-3 py-2
						rounded-md flex items-center gap-1 transition duration-300 ease-in-out'
                                onClick={logout}
                            >
                                <LogOut size={18} />
                                <span className='hidden sm:inline'>Logout</span>
                            </button>
                        ) : (
                            <>
                                <Link
                                    to={'/signup'}
                                    className='bg-stone-500 hover:bg-stone-600 text-white px-3 py-2
									rounded-md flex items-center gap-1 transition duration-300 ease-in-out'
                                >
                                    <UserPlus size={18} />
                                    <span className='hidden sm:inline'>Sign Up</span>
                                </Link>
                                <Link
                                    to={'/login'}
                                    className='bg-gray-700 hover:bg-gray-800 text-white px-3 py-2
									rounded-md flex items-center gap-1 transition duration-300 ease-in-out'
                                >
                                    <LogIn size={18} />
                                    <span className='hidden sm:inline'>Login</span>
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};
export default Navbar;