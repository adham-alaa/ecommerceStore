import { BarChart, PlusCircle, ShoppingBasket, Tag, Package, Folder } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import AnalyticsTab from "../components/AnalyticsTab";
import CreateProductForm from "../components/CreateProductForm";
import ProductsList from "../components/ProductsList";
import CouponTab from "../components/CouponTab";
import OrdersTab from "../components/OrdersTab";
import CategoryTab from "../components/CategoryTab";
import { useProductStore } from "../stores/useProductStore";

const tabs = [
    { id: "create", label: "Create Product", icon: PlusCircle },
    { id: "products", label: "Products", icon: ShoppingBasket },
    { id: "categories", label: "Categories", icon: Folder },
    { id: "orders", label: "Orders", icon: Package },
    { id: "coupons", label: "Coupons", icon: Tag },
    { id: "analytics", label: "Analytics", icon: BarChart },
];

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState("create");
    const { fetchAllProducts } = useProductStore();

    useEffect(() => {
        fetchAllProducts();
    }, [fetchAllProducts]);

    return (
        <div className='min-h-screen relative overflow-hidden'>
            <div className='relative z-10 container mx-auto px-4 py-16'>
                <motion.h1
                    className='text-4xl font-bold mb-8 text-gray-900 text-center'
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    Admin Dashboard
                </motion.h1>

                <div className='flex flex-wrap justify-center gap-2 mb-8'>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center px-3 sm:px-4 py-2 rounded-md transition-colors duration-200 text-sm sm:text-base ${activeTab === tab.id
                                ? "bg-gray-900 text-white"
                                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                                }`}
                        >
                            <tab.icon className='mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5' />
                            <span className='hidden sm:inline'>{tab.label}</span>
                            <span className='sm:hidden'>{tab.label.split(' ')[0]}</span>
                        </button>
                    ))}
                </div>
                {activeTab === "create" && <CreateProductForm />}
                {activeTab === "products" && <ProductsList />}
                {activeTab === "categories" && <CategoryTab />}
                {activeTab === "orders" && <OrdersTab />}
                {activeTab === "coupons" && <CouponTab />}
                {activeTab === "analytics" && <AnalyticsTab />}
            </div>
        </div>
    );
};
export default AdminPage;