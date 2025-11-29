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
        <header className='fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-stone-700'>
            <div className='container mx-auto px-4 py-3'>
                <div className='flex flex-wrap justify-between items-center'>
                    <Link to='/' className='text-2xl font-bold text-stone-400 items-center space-x-2 flex'>
                        HomePage
                    </Link>

                    <nav className='flex flex-wrap items-center gap-4'>


                        <div className='relative group'>
                            <button
                                className='flex items-center gap-1 text-gray-300 hover:text-stone-400 transition duration-300 ease-in-out'
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                Categories
                                <ChevronDown size={16} className='group-hover:text-stone-400' />
                            </button>
                            {dropdownOpen && (
                                <div className='absolute left-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 z-50'>
                                    {categories.length > 0 ? (
                                        categories.map((category) => (
                                            <Link
                                                key={category._id}
                                                to={`/category/${category.slug}`}
                                                className='block px-4 py-2 text-gray-300 hover:text-stone-400 hover:bg-gray-700 transition duration-300'
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
                            className='relative group text-gray-300 hover:text-stone-400 transition duration-300 
							ease-in-out'
                        >
                            <ShoppingCart className='inline-block mr-1 group-hover:text-stone-400' size={20} />
                            <span className='hidden sm:inline'>Cart</span>
                            {cart.length > 0 && (
                                <span
                                    className='absolute -top-2 -left-2 bg-stone-400 text-white rounded-full px-2 py-0.5 
									text-xs group-hover:bg-stone-300 transition duration-300 ease-in-out'
                                >
                                    {cart.length}
                                </span>
                            )}
                        </Link>

                        {isAdmin && (
                            <Link
                                className='bg-stone-600 hover:bg-stone-500 text-white px-3 py-1 rounded-md font-medium
								 transition duration-300 ease-in-out flex items-center'
                                to={"/secret-dashboard"}
                            >
                                <Lock className='inline-block mr-1' size={18} />
                                <span className='hidden sm:inline'>Dashboard</span>
                            </Link>
                        )}

                        {user ? (
                            <button
                                className='bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 
						rounded-md flex items-center transition duration-300 ease-in-out'
                                onClick={logout}
                            >
                                <LogOut size={18} />
                                <span className='hidden sm:inline ml-2'>Log Out</span>
                            </button>
                        ) : (
                            <>
                                <Link
                                    to={"/signup"}
                                    className='bg-stone-500 hover:bg-stone-600 text-white py-2 px-4 
									rounded-md flex items-center transition duration-300 ease-in-out'
                                >
                                    <UserPlus className='mr-2' size={18} />
                                    Sign Up
                                </Link>
                                <Link
                                    to={"/login"}
                                    className='bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 
									rounded-md flex items-center transition duration-300 ease-in-out'
                                >
                                    <LogIn className='mr-2' size={18} />
                                    Login
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