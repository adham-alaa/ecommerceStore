import axios from "axios";

// For mobile testing, replace 'localhost' with your computer's local IP (e.g., '192.168.1.5')
// Find your IP: Windows: ipconfig | Mac/Linux: ifconfig
const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api",
    withCredentials: true, // send cookies to the server
});

export default axiosInstance;