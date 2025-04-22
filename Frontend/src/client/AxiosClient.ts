import axios from "axios";

const API_URL = import.meta.env.VITE_API || "http://localhost:3000";
export const apiClient = axios.create({
  baseURL: API_URL, // Replace with your API base URL
  timeout: 5000, // Set a timeout if needed
  headers: {
    "Content-Type": "application/json",
  },
});
