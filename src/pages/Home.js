import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { logout, setOnlineUser, setSocketConnection, setUser } from '../redux/userSlice'
import Sidebar from '../components/Sidebar'
import logo from '../assets/logo1.png'
import io from 'socket.io-client'
import pattern from '../assets/bg_home1.jpeg';

const Home = () => {
  const user = useSelector(state => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)

  const fetchUserDetails = async () => {
    try {
      const URL = `${process.env.REACT_APP_BACKEND_URL}/api/user-details`
      const response = await axios({
        url: URL,
        withCredentials: true
      })

      dispatch(setUser(response.data.data))

      if (response.data.data.logout) {
        dispatch(logout())
        navigate("/email")
      }

      // Add a small delay before hiding the loading screen
      setTimeout(() => {
        setLoading(false)
      }, 1000); // 1 second delay for the animation
    } catch (error) {
      console.log("error", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserDetails()
  }, [])

  /***socket connection */
  useEffect(() => {
    const socketConnection = io(process.env.REACT_APP_BACKEND_URL, {
      transports: ['websocket'],
      auth: { token: localStorage.getItem('token') },
      secure: true,
      reconnectionAttempts: 5,
      pingInterval: 25000, // Custom ping interval
      pingTimeout: 60000 // Timeout before considering connection lost
    });


    socketConnection.on('onlineUser', (data) => {
      dispatch(setOnlineUser(data))
    })

    dispatch(setSocketConnection(socketConnection))

    return () => {
      socketConnection.off('onlineUser');
      socketConnection.disconnect()
    }
  }, [])


  const basePath = location.pathname === '/'
  return (
    <div>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#292F40] p-10">
          <div className="animate-glow">
            <img src={logo} alt="Logo" className="w-full" style={{ width: '-webkit-fill-available' }} />
          </div>
        </div>
      )}

      {!loading && (
        <div className='grid lg:grid-cols-[500px,1fr] bg-[#3A4259] h-screen max-h-screen'>
          <section className={`bg-[#3A4259] ${!basePath && "hidden"} lg:block`}>
            <Sidebar />
          </section>

          {/**message component**/}
          <section className={`${basePath && "hidden"}`} >
            <Outlet />
          </section>

          <div
            style={{
              backgroundImage: `url(${pattern})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#3A4259',
              width: '100%',
              height: '100vh',
              zIndex: 1,
              boxShadow: '0 10px 15px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -2px rgba(255, 255, 255, 0.05)', // White shadow
            }}
            className={`justify-center background-container items-center flex-col gap-2 hidden ${!basePath ? "hidden" : "lg:flex"}`}>
            <div className='z-40 opacity-100 flex flex-col justify-center items-center'>
              <img
                src={logo}
                width={250}
                alt='logo'
              />
              <p className='text-lg mt-2 font-bold text-white'>Select user to send message</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
