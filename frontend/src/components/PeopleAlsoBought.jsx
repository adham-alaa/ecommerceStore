import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";

const PeopleAlsoBought = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const res = await axios.get("/products/recommendations");
                setRecommendations(res.data.products || []);
            } catch (error) {
                // Silently fail - just don't show recommendations
                console.log("Could not fetch recommendations:", error.message);
                setRecommendations([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className='mt-8'>
            <h3 className='text-2xl font-semibold text-gray-900'>You may also like</h3>
            <div className='mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4'>
                {recommendations.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </div>
    );
};
export default PeopleAlsoBought;