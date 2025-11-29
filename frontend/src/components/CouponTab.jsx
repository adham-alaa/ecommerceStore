import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Tag, Trash2, Plus, Clock, Users, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";

const CouponTab = () => {
    const [coupons, setCoupons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        discountPercentage: "",
        expirationDays: "",
        maxUses: "",
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const response = await axios.get("/coupons/all");
            setCoupons(response.data || []);
        } catch (error) {
            console.error("Error fetching coupons:", error);
            toast.error("Failed to load coupons");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateCoupon = async (e) => {
        e.preventDefault();

        if (!formData.code || !formData.discountPercentage || !formData.expirationDays || !formData.maxUses) {
            toast.error("All fields are required");
            return;
        }

        try {
            await axios.post("/coupons", {
                code: formData.code.toUpperCase(),
                discountPercentage: Number(formData.discountPercentage),
                expirationDays: Number(formData.expirationDays),
                maxUses: Number(formData.maxUses),
            });

            toast.success("Coupon created successfully");
            setFormData({ code: "", discountPercentage: "", expirationDays: "", maxUses: "" });
            setShowCreateForm(false);
            fetchCoupons();
        } catch (error) {
            console.error("Error creating coupon:", error);
            toast.error(error.response?.data?.message || "Failed to create coupon");
        }
    };

    const handleDeleteCoupon = async (id) => {
        if (!window.confirm("Are you sure you want to delete this coupon?")) {
            return;
        }

        try {
            await axios.delete(`/coupons/${id}`);
            toast.success("Coupon deleted successfully");
            fetchCoupons();
        } catch (error) {
            console.error("Error deleting coupon:", error);
            toast.error("Failed to delete coupon");
        }
    };

    const handleToggleCoupon = async (id) => {
        try {
            await axios.patch(`/coupons/${id}/toggle`);
            toast.success("Coupon status updated");
            fetchCoupons();
        } catch (error) {
            console.error("Error toggling coupon:", error);
            toast.error("Failed to update coupon status");
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading coupons...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Create Coupon Button */}
            <div className="mb-6 flex justify-end">
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-500 text-white rounded-md hover:bg-stone-600 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    {showCreateForm ? "Cancel" : "Create Coupon"}
                </button>
            </div>

            {/* Create Coupon Form */}
            {showCreateForm && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 p-6 rounded-lg mb-8 "
                >
                    <h2 className="text-2xl font-semibold mb-4 text-stone-400">Create New Coupon</h2>
                    <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Coupon Code</label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                placeholder="e.g., SUMMER25"
                                className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Discount Percentage</label>
                            <input
                                type="number"
                                value={formData.discountPercentage}
                                onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                                placeholder="e.g., 25"
                                min="1"
                                max="100"
                                className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Expiration (Days)</label>
                            <input
                                type="number"
                                value={formData.expirationDays}
                                onChange={(e) => setFormData({ ...formData, expirationDays: e.target.value })}
                                placeholder="e.g., 30"
                                min="1"
                                className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Max Uses</label>
                            <input
                                type="number"
                                value={formData.maxUses}
                                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                                placeholder="e.g., 100"
                                min="1"
                                className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                className="w-full px-4 py-2 bg-stone-500 text-white rounded-md hover:bg-stone-600 transition-colors"
                            >
                                Create Coupon
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Coupons List */}
            <div className="bg-gray-800 rounded-lg overflow-hidden ">
                <div className="px-6 py-4 border-b border-gray-700">
                    <h2 className="text-2xl font-semibold text-stone-400">All Coupons</h2>
                </div>

                {coupons.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        No coupons found. Create your first coupon!
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Code
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Discount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Usage
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Expiration
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {coupons.map((coupon) => {
                                    const isExpired = new Date(coupon.expirationDate) < new Date();
                                    const usagePercentage = (coupon.currentUses / coupon.maxUses) * 100;

                                    return (
                                        <motion.tr
                                            key={coupon._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-gray-700/50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Tag className="h-4 w-4 mr-2 text-stone-400" />
                                                    <span className="font-mono font-semibold text-stone-400">
                                                        {coupon.code}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-white font-semibold">
                                                    {coupon.discountPercentage}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-gray-400" />
                                                    <span className="text-white">
                                                        {coupon.currentUses} / {coupon.maxUses}
                                                    </span>
                                                    <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all ${usagePercentage >= 100
                                                                ? "bg-red-500"
                                                                : usagePercentage >= 80
                                                                    ? "bg-yellow-500"
                                                                    : "bg-stone-400"
                                                                }`}
                                                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span className={isExpired ? "text-red-400" : "text-white"}>
                                                        {formatDate(coupon.expirationDate)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${coupon.isActive
                                                        ? "bg-stone-800/50 text-stone-300"
                                                        : "bg-red-900/50 text-red-400"
                                                        }`}
                                                >
                                                    {coupon.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleToggleCoupon(coupon._id)}
                                                        className="p-2 hover:bg-gray-600 rounded-md transition-colors"
                                                        title={coupon.isActive ? "Deactivate" : "Activate"}
                                                    >
                                                        {coupon.isActive ? (
                                                            <ToggleRight className="h-5 w-5 text-stone-400" />
                                                        ) : (
                                                            <ToggleLeft className="h-5 w-5 text-gray-400" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCoupon(coupon._id)}
                                                        className="p-2 hover:bg-red-600/20 rounded-md transition-colors"
                                                        title="Delete coupon"
                                                    >
                                                        <Trash2 className="h-5 w-5 text-red-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CouponTab;
