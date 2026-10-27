import React, { useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { useParams, useSearchParams } from 'react-router-dom';

const Loader = () => {
    const { navigate, axios, getToken } = useAppContext();
    const { nextUrl } = useParams();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');

    const verifyPayment = async () => {
        try {
            await axios.post('/api/bookings/verify-stripe', { sessionId }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            navigate(`/${nextUrl}`)
        } catch (error) {
            console.log(error);
            navigate(`/${nextUrl}`)
        }
    }

    useEffect(() => {
        if (sessionId) {
            verifyPayment();
        } else if (nextUrl) {
            setTimeout(() => {
                navigate(`/${nextUrl}`)
            }, 8000)
        }
    }, [nextUrl, sessionId])

    return (
        <div className='flex justify-center items-center h-screen'>
            <div className='animate-spin rounded-full h-24 w-24 border-4 border-gray-300 border-t-primary'> </div>
        </div>
    )
}

export default Loader