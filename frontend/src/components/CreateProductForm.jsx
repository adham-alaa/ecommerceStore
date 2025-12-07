import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Upload, Loader } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import axios from "../lib/axios";
import toast from "react-hot-toast";

const availableSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const CreateProductForm = () => {
    const [categories, setCategories] = useState([]);
    const [colorInput, setColorInput] = useState("");
    const [colorImageInput, setColorImageInput] = useState("");
    const [selectedSizesForColor, setSelectedSizesForColor] = useState([]);
    const [sizeStocks, setSizeStocks] = useState({});
    const [newProduct, setNewProduct] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
        sizeChart: "",
        colorVariants: [],
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get("/categories");
            setCategories(response.data.categories || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Failed to load categories");
        }
    };

    const { createProduct, loading } = useProductStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createProduct(newProduct);
            setNewProduct({ name: "", description: "", price: "", category: "", image: "", sizeChart: "", colorVariants: [] });
            setColorInput("");
            setColorImageInput("");
            setSelectedSizesForColor([]);
            setSizeStocks({});
        } catch {
            console.log("error creating a product");
        }
    };

    const toggleSizeForColor = (size) => {
        setSelectedSizesForColor(prev => {
            if (prev.includes(size)) {
                // Remove size and its stock
                const newStocks = { ...sizeStocks };
                delete newStocks[size];
                setSizeStocks(newStocks);
                return prev.filter(s => s !== size);
            } else {
                // Add size with default stock of 0
                setSizeStocks(prev => ({ ...prev, [size]: 0 }));
                return [...prev, size];
            }
        });
    };

    const updateSizeStock = (size, stock) => {
        setSizeStocks(prev => ({ ...prev, [size]: parseInt(stock) || 0 }));
    };

    const handleColorImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setColorImageInput(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const addColorOption = () => {
        if (!colorInput.trim() || !colorImageInput) {
            toast.error("Please enter color name and upload an image");
            return;
        }
        if (selectedSizesForColor.length === 0) {
            toast.error("Please select at least one size for this color");
            return;
        }

        const colorExists = newProduct.colorVariants.some(opt => opt.color === colorInput.trim());
        if (colorExists) {
            toast.error("This color already exists");
            return;
        }

        const sizes = selectedSizesForColor.map(size => ({
            size,
            stock: sizeStocks[size] || 0
        }));

        setNewProduct(prev => ({
            ...prev,
            colorVariants: [...prev.colorVariants, {
                color: colorInput.trim(),
                image: colorImageInput,
                sizes
            }]
        }));
        setColorInput("");
        setColorImageInput("");
        setSelectedSizesForColor([]);
        setSizeStocks({});
    };

    const removeColorVariant = (colorToRemove) => {
        setNewProduct(prev => ({
            ...prev,
            colorVariants: prev.colorVariants.filter(c => c.color !== colorToRemove)
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onloadend = () => {
                setNewProduct({ ...newProduct, image: reader.result });
            };

            reader.readAsDataURL(file); // base64
        }
    };

    return (
        <motion.div
            className='bg-white shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            <h2 className='text-2xl font-semibold mb-6 text-gray-900'>Create New Product</h2>

            <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                    <label htmlFor='name' className='block text-sm font-medium text-gray-700'>
                        Product Name
                    </label>
                    <input
                        type='text'
                        id='name'
                        name='name'
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        className='mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2
						px-3 text-gray-900 focus:outline-none focus:ring-2
						focus:ring-gray-400 focus:border-gray-400'
                        required
                    />
                </div>

                <div>
                    <label htmlFor='description' className='block text-sm font-medium text-gray-700'>
                        Description
                    </label>
                    <textarea
                        id='description'
                        name='description'
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        rows='3'
                        className='mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm
						 py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 
						 focus:border-gray-400'
                        required
                    />
                </div>

                <div>
                    <label htmlFor='price' className='block text-sm font-medium text-gray-700'>
                        Price
                    </label>
                    <input
                        type='number'
                        id='price'
                        name='price'
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        step='0.01'
                        className='mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm 
						py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400
						 focus:border-gray-400'
                        required
                    />
                </div>

                <div>
                    <label htmlFor='category' className='block text-sm font-medium text-gray-700'>
                        Category
                    </label>
                    <select
                        id='category'
                        name='category'
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className='mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md
						 shadow-sm py-2 px-3 text-gray-900 focus:outline-none 
						 focus:ring-2 focus:ring-gray-400 focus:border-gray-400'
                        required
                    >
                        <option value=''>Select a category</option>
                        {categories.map((category) => (
                            <option key={category._id} value={category.name}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Color Variants (Each color has its own sizes and stock)
                    </label>
                    <div className='space-y-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-300'>
                        <input
                            type='text'
                            value={colorInput}
                            onChange={(e) => setColorInput(e.target.value)}
                            placeholder='Enter color name (e.g., Red, Blue)'
                            className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400'
                        />
                        <div className='flex gap-2 items-center'>
                            <input
                                type='file'
                                id='colorImage'
                                className='sr-only'
                                accept='image/*'
                                onChange={handleColorImageChange}
                            />
                            <label
                                htmlFor='colorImage'
                                className='flex-1 cursor-pointer bg-gray-100 py-2 px-3 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-200 text-center'
                            >
                                <Upload className='h-4 w-4 inline-block mr-2' />
                                {colorImageInput ? 'Image uploaded' : 'Upload color image'}
                            </label>
                        </div>

                        {/* Size selection for this color */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Select sizes for this color
                            </label>
                            <div className='flex flex-wrap gap-2 mb-3'>
                                {availableSizes.map((size) => (
                                    <button
                                        key={size}
                                        type='button'
                                        onClick={() => toggleSizeForColor(size)}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedSizesForColor.includes(size)
                                            ? 'bg-stone-500 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>

                            {/* Stock inputs for selected sizes */}
                            {selectedSizesForColor.length > 0 && (
                                <div className='space-y-2'>
                                    <p className='text-sm text-gray-400 mb-2'>Set stock for each size:</p>
                                    <div className='grid grid-cols-2 gap-2'>
                                        {selectedSizesForColor.map((size) => (
                                            <div key={size} className='flex items-center gap-2'>
                                                <label className='text-sm text-gray-700 w-10'>{size}:</label>
                                                <input
                                                    type='number'
                                                    min='0'
                                                    value={sizeStocks[size] || 0}
                                                    onChange={(e) => updateSizeStock(size, e.target.value)}
                                                    className='flex-1 px-2 py-1 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400'
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type='button'
                            onClick={addColorOption}
                            className='w-full px-6 py-2 bg-stone-500 text-white rounded-md hover:bg-stone-600 transition-colors'
                        >
                            Add Color Variant
                        </button>
                    </div>
                    {newProduct.colorVariants.length > 0 && (
                        <div className='space-y-3'>
                            {newProduct.colorVariants.map((variant, index) => (
                                <div
                                    key={index}
                                    className='relative bg-gray-100 rounded-lg p-4 border border-gray-300'
                                >
                                    <button
                                        type='button'
                                        onClick={() => removeColorVariant(variant.color)}
                                        className='absolute top-2 right-2 text-red-600 hover:text-red-700 bg-white border border-gray-300 rounded-full w-7 h-7 flex items-center justify-center text-xl'
                                    >
                                        ×
                                    </button>
                                    <div className='flex gap-4'>
                                        <img
                                            src={variant.image}
                                            alt={variant.color}
                                            className='w-24 h-24 object-cover rounded'
                                        />
                                        <div className='flex-1'>
                                            <p className='text-gray-900 text-lg font-medium mb-2'>{variant.color}</p>
                                            <div className='flex flex-wrap gap-2'>
                                                {variant.sizes.map((sizeObj) => (
                                                    <span
                                                        key={sizeObj.size}
                                                        className='px-2 py-1 bg-white border border-gray-300 text-gray-700 rounded text-xs'
                                                    >
                                                        {sizeObj.size}: {sizeObj.stock} stock
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className='mt-1 flex items-center'>
                    <input type='file' id='image' className='sr-only' accept='image/*' onChange={handleImageChange} />
                    <label
                        htmlFor='image'
                        className='cursor-pointer bg-gray-100 py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400'
                    >
                        <Upload className='h-5 w-5 inline-block mr-2' />
                        Upload Product Image
                    </label>
                    {newProduct.image && <span className='ml-3 text-sm text-gray-400'>Image uploaded </span>}
                </div>

                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Size Chart (Optional)
                    </label>
                    <div className='mt-1 flex items-center'>
                        <input
                            type='file'
                            id='sizeChart'
                            className='sr-only'
                            accept='image/*'
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setNewProduct({ ...newProduct, sizeChart: reader.result });
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        <label
                            htmlFor='sizeChart'
                            className='cursor-pointer bg-gray-100 py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400'
                        >
                            <Upload className='h-5 w-5 inline-block mr-2' />
                            Upload Size Chart
                        </label>
                        {newProduct.sizeChart && <span className='ml-3 text-sm text-gray-400'>Size chart uploaded </span>}
                    </div>
                    {newProduct.sizeChart && (
                        <div className='mt-3'>
                            <img
                                src={newProduct.sizeChart}
                                alt='Size Chart Preview'
                                className='max-w-full h-auto rounded-lg border border-gray-300'
                            />
                        </div>
                    )}
                </div>

                <button
                    type='submit'
                    className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
					shadow-sm text-sm font-medium text-white bg-stone-500 hover:bg-stone-600 
					focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-400 disabled:opacity-50'
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader className='mr-2 h-5 w-5 animate-spin' aria-hidden='true' />
                            Loading...
                        </>
                    ) : (
                        <>
                            <PlusCircle className='mr-2 h-5 w-5' />
                            Create Product
                        </>
                    )}
                </button>
            </form>
        </motion.div>
    );
};
export default CreateProductForm;