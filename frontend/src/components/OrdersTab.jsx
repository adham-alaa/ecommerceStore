import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Package, User, MapPin, Phone, Mail, Calendar, CreditCard, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const OrdersTab = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedOrders, setExpandedOrders] = useState(new Set());
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get("/payments/orders/all");
            setOrders(response.data.orders || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error("Failed to load orders");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await axios.patch(`/payments/orders/${orderId}/status`, {
                paymentStatus: newStatus,
            });
            toast.success("Order status updated successfully");
            fetchOrders();
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error("Failed to update order status");
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
            return;
        }

        try {
            await axios.delete(`/payments/orders/${orderId}`);
            toast.success("Order deleted successfully");
            fetchOrders();
        } catch (error) {
            console.error("Error deleting order:", error);
            toast.error(error.response?.data?.message || "Failed to delete order");
        }
    };

    const toggleOrderExpansion = (orderId) => {
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId);
        } else {
            newExpanded.add(orderId);
        }
        setExpandedOrders(newExpanded);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "bg-yellow-900/50 text-yellow-400";
            case "paid":
                return "bg-stone-800/50 text-stone-300";
            case "cancelled":
                return "bg-red-900/50 text-red-400";
            default:
                return "bg-gray-900/50 text-gray-400";
        }
    };

    const filteredOrders = filterStatus === "all"
        ? orders
        : orders.filter(order => order.paymentStatus === filterStatus);

    if (isLoading) {
        return <div className="text-center py-8">Loading orders...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Filter Bar */}
            <div className="mb-6 flex items-center gap-4">
                <span className="text-gray-700">Filter by status:</span>
                <div className="flex gap-2">
                    {["all", "pending", "paid", "cancelled"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-md capitalize transition-colors ${filterStatus === status
                                ? "bg-gray-900 text-white"
                                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <span className="ml-auto text-gray-700">
                    Total: {filteredOrders.length} orders
                </span>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 text-gray-600 bg-white border border-gray-200 rounded-lg">
                        No orders found
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        const isExpanded = expandedOrders.has(order._id);

                        return (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                            >
                                {/* Order Header */}
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <Package className="h-6 w-6 text-gray-700" />
                                            <div>
                                                <p className="text-sm text-gray-600">Order ID</p>
                                                <p className="font-mono text-gray-900 font-semibold">
                                                    #{order._id.slice(-8).toUpperCase()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {order.totalAmount} EGP
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {order.products.length} item(s)
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span className="text-gray-900">{formatDate(order.createdAt)}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm">
                                            <CreditCard className="h-4 w-4 text-gray-500" />
                                            <span className="text-gray-900 capitalize">{order.paymentMethod}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(
                                                    order.paymentStatus
                                                )}`}
                                            >
                                                {order.paymentStatus}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Customer Info Preview */}
                                    <div className="flex items-center gap-2 text-sm text-gray-900">
                                        <User className="h-4 w-4 text-gray-500" />
                                        <span>{order.customerInfo.name}</span>
                                        <span className="text-gray-500">•</span>
                                        <span>{order.customerInfo.email}</span>
                                    </div>
                                </div>

                                {/* Expandable Section */}
                                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                                    <button
                                        onClick={() => toggleOrderExpansion(order._id)}
                                        className="flex items-center justify-between w-full text-left text-gray-900 hover:text-gray-700 transition-colors"
                                    >
                                        <span className="text-sm font-medium">
                                            {isExpanded ? "Hide Details" : "View Details"}
                                        </span>
                                        {isExpanded ? (
                                            <ChevronUp className="h-5 w-5" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>

                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="p-6 space-y-6"
                                    >
                                        {/* Customer Details */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 text-gray-900">
                                                Customer Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div className="flex items-start gap-2">
                                                    <User className="h-4 w-4 text-gray-500 mt-0.5" />
                                                    <div>
                                                        <p className="text-gray-600">Name</p>
                                                        <p className="text-gray-900">{order.customerInfo.name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                                                    <div>
                                                        <p className="text-gray-600">Email</p>
                                                        <p className="text-gray-900">{order.customerInfo.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                                                    <div>
                                                        <p className="text-gray-600">Phone</p>
                                                        <p className="text-gray-900">{order.customerInfo.phone}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                                                    <div>
                                                        <p className="text-gray-600">Delivery Address</p>
                                                        <p className="text-gray-900">
                                                            {order.customerInfo.address.street}
                                                            {order.customerInfo.address.apartment &&
                                                                `, ${order.customerInfo.address.apartment}`}
                                                        </p>
                                                        <p className="text-gray-900">
                                                            {order.customerInfo.address.city}, {order.customerInfo.address.governorate}
                                                        </p>
                                                        <p className="text-gray-900">
                                                            {order.customerInfo.address.postalCode}, {order.customerInfo.address.country}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Products */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 text-gray-900">
                                                Order Items
                                            </h3>
                                            <div className="space-y-3">
                                                {order.products.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200"
                                                    >
                                                        {item.product?.image && (
                                                            <img
                                                                src={item.product.image}
                                                                alt={item.product.name}
                                                                className="w-16 h-16 object-cover rounded"
                                                            />
                                                        )}
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900">
                                                                {item.product?.name || "Product"}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <p className="text-sm text-gray-600">
                                                                    Quantity: {item.quantity}
                                                                </p>
                                                                {item.size && (
                                                                    <>
                                                                        <span className="text-gray-500">•</span>
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-stone-800/50 text-stone-200 border border-stone-600">
                                                                            Size: {item.size}
                                                                        </span>
                                                                    </>
                                                                )}
                                                                {item.color && (
                                                                    <>
                                                                        <span className="text-gray-500">•</span>
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-700">
                                                                            Color: {item.color}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-gray-900 font-semibold">
                                                                {item.price} EGP
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                each
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Status Update */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 text-gray-900">
                                                Update Order Status
                                            </h3>
                                            <div className="flex gap-2">
                                                {["pending", "paid", "cancelled"].map((status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleUpdateStatus(order._id, status)}
                                                        disabled={order.paymentStatus === status}
                                                        className={`px-4 py-2 rounded-md capitalize transition-colors ${order.paymentStatus === status
                                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                            : "bg-gray-900 text-white hover:bg-gray-800"
                                                            }`}
                                                    >
                                                        Mark as {status}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Delete Order */}
                                        <div className="pt-4 border-t border-gray-200">
                                            <button
                                                onClick={() => handleDeleteOrder(order._id)}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete Order
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default OrdersTab;
