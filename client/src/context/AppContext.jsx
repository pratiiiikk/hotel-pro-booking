import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/react";
import { toast } from "react-hot-toast";
import { roomsDummyData } from "../assets/assets";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {

    const currency = import.meta.env.VITE_CURRENCY || "$";
    const navigate = useNavigate();
    const { user, isSignedIn } = useUser();
    const { getToken } = useAuth();

    const [isOwner, setIsOwner] = useState(false);
    const [showHotelReg, setShowHotelReg] = useState(false);
    const [searchedCities, setSearchedCities] = useState([]);
    const [rooms, setRooms] = useState(roomsDummyData);

    const fetchRooms = async () => {
        try {
            const { data } = await axios.get('/api/rooms');
            if (data.success && Array.isArray(data.rooms) && data.rooms.length > 0) {
                setRooms(data.rooms);
            } else {
                // If database has no rooms yet, show demo rooms for demo presentation
                setRooms(roomsDummyData);
            }
        } catch (error) {
            // If backend is sleeping or spinning up on Render free tier, fallback to demo rooms
            console.log("Using demo rooms preview:", error.message);
            setRooms(roomsDummyData);
        }
    }

    const fetchUser = async () => {
        try {
            const { data } = await axios.get('/api/user', {
                headers: {
                    Authorization:
                        `Bearer ${await getToken()}`
                }
            })
            if (data.success) {
                setIsOwner(data.role === "hotelOwner")
                setSearchedCities(data.recentSearchedCities)
            } else {
                //* Retry Fetching User Details after 5 seconds
                setTimeout(() => {
                    fetchUser()
                }, 5000)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (isSignedIn) {
            fetchUser();
        }
    }, [isSignedIn])

    useEffect(() => {
        fetchRooms();

        // Keep-alive ping for Render Free Tier (every 5 minutes)
        const keepAlive = setInterval(() => {
            axios.get('/api/rooms').catch(() => {}); // Simple ping
        }, 5 * 60 * 1000);

        return () => clearInterval(keepAlive);
    }, [])

    const value = {
        currency, navigate, user, getToken, isOwner, setIsOwner, axios,
        showHotelReg, setShowHotelReg, searchedCities, setSearchedCities, rooms, setRooms
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext);