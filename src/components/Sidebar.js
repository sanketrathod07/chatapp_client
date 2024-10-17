import React, { useEffect, useState } from 'react'
import { IoChatbubbleEllipses } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { NavLink, useNavigate } from 'react-router-dom';
import { BiLogOut } from "react-icons/bi";
import Avatar from './Avatar'
import { useDispatch, useSelector } from 'react-redux';
import EditUserDetails from './EditUserDetails';
import Divider from './Divider';
import { FiArrowUpLeft } from "react-icons/fi";
import SearchUser from './SearchUser';
import { FaImage } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import { logout } from '../redux/userSlice';

const Sidebar = () => {
    const user = useSelector(state => state?.user)
    const [editUserOpen, setEditUserOpen] = useState(false)
    const [allUser, setAllUser] = useState([])
    const [openSearchUser, setOpenSearchUser] = useState(false)
    const socketConnection = useSelector(state => state?.user?.socketConnection)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        if (socketConnection) {
            socketConnection.emit('sidebar', user._id)

            socketConnection.on('conversation', (data) => {
                const conversationUserData = data.map((conversationUser, index) => {
                    if (conversationUser?.sender?._id === conversationUser?.receiver?._id) {
                        return {
                            ...conversationUser,
                            userDetails: conversationUser?.sender
                        }
                    }
                    else if (conversationUser?.receiver?._id !== user?._id) {
                        return {
                            ...conversationUser,
                            userDetails: conversationUser.receiver
                        }
                    } else {
                        return {
                            ...conversationUser,
                            userDetails: conversationUser.sender
                        }
                    }
                })

                setAllUser(conversationUserData)
            })
        }
    }, [socketConnection, user])

    const handleLogout = () => {
        dispatch(logout())
        navigate("/email")
        localStorage.clear()
    }

    return (
        <div className='w-full h-full grid grid-cols-[56px,1fr] bg-[#32394D]'>
            <div className='bg-[#292F40] w-14 h-full rounded-tr-lg rounded-br-lg py-5 text-slate-600 flex flex-col justify-between'>
                <div>
                    <NavLink className={({ isActive }) => `w-14 h-12 text-white flex justify-center items-center cursor-pointer hover:bg-[#59678a] rounded ${isActive && "bg-[#32394D]"}`} title='chat'>
                        <IoChatbubbleEllipses
                            size={20}
                        />
                    </NavLink>

                    <NavLink title='add friend' onClick={() => setOpenSearchUser(true)} className={`w-14 h-12 text-white flex justify-center items-center cursor-pointer hover:bg-[#59678a] rounded ${setOpenSearchUser && "bg-[#292F40]"}`} >
                        <FaUserPlus size={20} />
                    </NavLink>
                </div>

                <div className='flex flex-col items-center'>
                    <button
                        type="button"
                        title="Connect with Developer"
                        className="relative flex mb-2 rounded-full bg-[#161616] p-3 text-xs font-medium text-white shadow-md hover:shadow-lg hover:bg-[#d33890] focus:shadow-lg transition duration-150 ease-in-out group"
                    >
                        <div
                            className="absolute top-1 right-[5px] z-10 translate-x-1/2 -translate-y-1/2 bg-red-600 text-[10px] font-medium text-white rounded-full px-1 py-[2px]"
                        >
                            1+
                        </div>

                        <span className="w-5 h-5 relative">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 448 512"
                                className="w-full h-full"
                            >
                                <path
                                    d="M100.3 448H7.4V148.9h92.9zM53.8 108.1C24.1 108.1 0 83.5 0 53.8a53.8 53.8 0 0 1 107.6 0c0 29.7-24.1 54.3-53.8 54.3zM447.9 448h-92.7V302.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z"
                                />
                            </svg>
                        </span>
                        <div
                            className="absolute top-1/2 left-full ml-3 transform -translate-y-1/2 w-max p-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                            Connect with Developer
                        </div>
                    </button>



                    <button className='mx-auto' title={user?.name} onClick={() => setEditUserOpen(true)}>
                        <Avatar
                            width={40}
                            height={40}
                            name={user?.name}
                            imageUrl={user?.profile_pic}
                            userId={user?._id}
                        />
                    </button>
                    <button title='logout' className='w-14 h-12 m-[0.4rem] bg-[#131b2b] flex justify-center items-center cursor-pointer hover:bg-[#59678a] rounded' onClick={handleLogout}>
                        <span className='-ml-2 text-white'>
                            <BiLogOut size={20} />
                        </span>
                    </button>
                </div>
            </div>

            <div className='w-full'>
                <div className='h-16 flex items-center'>
                    <h2 className='text-xl font-bold p-4 text-white'>Message</h2>
                </div>
                <div className='bg-slate-200 p-[0.5px]'></div>

                <div className=' h-[calc(100vh-65px)] overflow-x-hidden overflow-y-auto scrollbar'>
                    {
                        allUser.length === 0 && (
                            <div className='mt-12 p-2'>
                                <div className='flex justify-center items-center my-4 text-white'>
                                    <FiArrowUpLeft
                                        size={50}
                                    />
                                </div>
                                <p className='text-lg text-center text-white'>Explore users to start a conversation with.</p>
                            </div>
                        )
                    }

                    {
                        allUser.map((conv, index) => {
                            console.log("Conv", conv)
                            return (
                                <NavLink
                                    to={"/" + conv?.userDetails?._id}
                                    key={conv?._id}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 py-3 px-4 rounded-sm cursor-pointer 
                                        ${isActive ? 'bg-[#3A4259] border-transparent' : 'hover:bg-[#3A4259] border-transparent'}`}
                                >
                                    <div className='text-white'>
                                        <Avatar
                                            imageUrl={conv?.userDetails?.profile_pic}
                                            name={conv?.userDetails?.name}
                                            width={40}
                                            height={40}
                                        />
                                    </div>
                                    <div className='flex-1'>
                                        <h3 className='font-semibold text-base text-white'>{conv?.userDetails?.name}</h3>
                                        <div className='text-slate-400 text-xs font-semibold flex items-center'>
                                            <div className='flex items-center gap-1'>
                                                {conv?.lastMsg?.imageUrl && (
                                                    <div className='flex items-center gap-1'>
                                                        <span><FaImage /></span>
                                                        {!conv?.lastMsg?.text && <span>Image</span>}
                                                    </div>
                                                )}
                                                {conv?.lastMsg?.videoUrl && (
                                                    <div className='flex items-center gap-1'>
                                                        <span><FaVideo /></span>
                                                        {!conv?.lastMsg?.text && <span>Video</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <p className='text-ellipsis line-clamp-1'>{conv?.lastMsg?.text}</p>
                                        </div>
                                    </div>
                                    <div className='flex flex-col gap-1'>
                                        <div className='text-white text-xs'>
                                            {new Date(conv?.lastMsg?.createdAt).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            })}
                                        </div>
                                        {Boolean(conv?.unseenMsg) && (
                                            <p className='text-xs w-6 h-6 flex justify-center items-center ml-auto p-0 bg-[#5865F2] text-white font-semibold rounded-full'>
                                                {conv?.unseenMsg}
                                            </p>
                                        )}
                                    </div>
                                </NavLink>
                            );
                        })
                    }
                </div>
            </div>

            {/**edit user details*/}
            {
                editUserOpen && (
                    <EditUserDetails onClose={() => setEditUserOpen(false)} user={user} />
                )
            }

            {/**search user */}
            {
                openSearchUser && (
                    <SearchUser onClose={() => setOpenSearchUser(false)} userId={user._id} />
                )
            }

        </div>
    )
}

export default Sidebar
