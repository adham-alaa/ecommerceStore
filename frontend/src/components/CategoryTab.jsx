import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Tag, Trash2, Plus, Edit2, X, Check } from "lucide-react";
import toast from "react-hot-toast";

const CategoryTab = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState("");

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
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();

        if (!newCategoryName.trim()) {
            toast.error("Category name is required");
            return;
        }

        try {
            await axios.post("/categories", { name: newCategoryName.trim() });
            toast.success("Category created successfully");
            setNewCategoryName("");
            setShowCreateForm(false);
            fetchCategories();
        } catch (error) {
            console.error("Error creating category:", error);
            toast.error(error.response?.data?.message || "Failed to create category");
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category? Products using this category will need to be updated.")) {
            return;
        }

        try {
            await axios.delete(`/categories/${id}`);
            toast.success("Category deleted successfully");
            fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
            toast.error("Failed to delete category");
        }
    };

    const handleStartEdit = (category) => {
        setEditingId(category._id);
        setEditingName(category.name);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingName("");
    };

    const handleSaveEdit = async (id) => {
        if (!editingName.trim()) {
            toast.error("Category name is required");
            return;
        }

        try {
            await axios.put(`/categories/${id}`, { name: editingName.trim() });
            toast.success("Category updated successfully");
            setEditingId(null);
            setEditingName("");
            fetchCategories();
        } catch (error) {
            console.error("Error updating category:", error);
            toast.error(error.response?.data?.message || "Failed to update category");
        }
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading categories...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Create Category Button */}
            <div className="mb-6 flex justify-end">
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    {showCreateForm ? "Cancel" : "Create Category"}
                </button>
            </div>

            {/* Create Category Form */}
            {showCreateForm && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 p-6 rounded-lg mb-8"
                >
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900">Create New Category</h2>
                    <form onSubmit={handleCreateCategory} className="flex gap-4">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Category name (e.g., T-Shirts, Jeans)"
                            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
                        />
                        <button
                            type="submit"
                            className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                        >
                            Create
                        </button>
                    </form>
                </motion.div>
            )}

            {/* Categories List */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-900">All Categories</h2>
                </div>

                {categories.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        No categories found. Create your first category!
                    </div>
                ) : (
                    <div className="divide-y divide-gray-700">
                        {categories.map((category) => (
                            <motion.div
                                key={category._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="px-6 py-4 hover:bg-gray-700/50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    {editingId === category._id ? (
                                        // Edit Mode
                                        <div className="flex items-center gap-3 flex-1">
                                            <Tag className="h-5 w-5 text-stone-400 shrink-0" />
                                            <input
                                                type="text"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                className="flex-1 px-3 py-1 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleSaveEdit(category._id)}
                                                className="p-2 hover:bg-stone-600/20 rounded-md transition-colors"
                                                title="Save"
                                            >
                                                <Check className="h-5 w-5 text-stone-400" />
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="p-2 hover:bg-red-600/20 rounded-md transition-colors"
                                                title="Cancel"
                                            >
                                                <X className="h-5 w-5 text-red-400" />
                                            </button>
                                        </div>
                                    ) : (
                                        // View Mode
                                        <>
                                            <div className="flex items-center gap-3">
                                                <Tag className="h-5 w-5 text-stone-400" />
                                                <span className="text-lg font-medium text-gray-900">
                                                    {category.name}
                                                </span>
                                                <span className="text-sm text-gray-400">
                                                    ({category.slug})
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleStartEdit(category)}
                                                    className="p-2 hover:bg-gray-600 rounded-md transition-colors"
                                                    title="Edit category"
                                                >
                                                    <Edit2 className="h-5 w-5 text-blue-400" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(category._id)}
                                                    className="p-2 hover:bg-red-600/20 rounded-md transition-colors"
                                                    title="Delete category"
                                                >
                                                    <Trash2 className="h-5 w-5 text-red-400" />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryTab;
