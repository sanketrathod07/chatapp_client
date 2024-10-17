import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import Avatar from './Avatar'
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import { FaImage } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import uploadFile from '../helpers/uploadFile';
import { IoClose } from "react-icons/io5";
import Loading from './Loading';
import backgroundImage from '../assets/wallapaper.jpeg'
import { IoMdHappy, IoMdSend } from "react-icons/io";
import moment from 'moment'
import { FaPhoneAlt, FaThumbtack } from 'react-icons/fa';

const MessagePage = () => {
  const params = useParams()
  const socketConnection = useSelector(state => state?.user?.socketConnection)
  const user = useSelector(state => state?.user)
  const [dataUser, setDataUser] = useState({
    name: "",
    email: "",
    profile_pic: "",
    online: false,
    _id: ""
  })
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false)
  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: ""
  })
  const [loading, setLoading] = useState(false)
  const [allMessage, setAllMessage] = useState([])
  const currentMessage = useRef(null)

  // State to track last message sent time
  const [senderLastMessageTime, setSenderLastMessageTime] = useState(null);
  const [awayTime, setAwayTime] = useState(0);

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [allMessage])

  useEffect(() => {
    const interval = setInterval(() => {
      if (senderLastMessageTime) {
        const timeDiffInSeconds = Math.floor((Date.now() - senderLastMessageTime) / 1000);
        let displayTime;

        if (timeDiffInSeconds < 60) {
          displayTime = `${timeDiffInSeconds} seconds`;
        } else if (timeDiffInSeconds < 3600) { // less than 1 hour
          const minutes = Math.floor(timeDiffInSeconds / 60);
          displayTime = `${minutes} minutes`;
        } else if (timeDiffInSeconds < 86400) { // less than 1 day
          const hours = Math.floor(timeDiffInSeconds / 3600);
          displayTime = `${hours} hours`;
        } else { // 1 day or more
          const days = Math.floor(timeDiffInSeconds / 86400);
          displayTime = `${days} days`;
        }

        setAwayTime(displayTime);
      }
    }, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, [senderLastMessageTime]);



  const handleUploadImageVideoOpen = () => {
    setOpenImageVideoUpload(preve => !preve)
  }

  const handleUploadImage = async (e) => {
    const file = e.target.files[0]

    setLoading(true)
    const uploadPhoto = await uploadFile(file)
    setLoading(false)
    setOpenImageVideoUpload(false)

    setMessage(preve => {
      return {
        ...preve,
        imageUrl: uploadPhoto.url
      }
    })
  }
  const handleClearUploadImage = () => {
    setMessage(preve => {
      return {
        ...preve,
        imageUrl: ""
      }
    })
  }

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0]

    setLoading(true)
    const uploadPhoto = await uploadFile(file)
    setLoading(false)
    setOpenImageVideoUpload(false)

    setMessage(preve => {
      return {
        ...preve,
        videoUrl: uploadPhoto.url
      }
    })
  }
  const handleClearUploadVideo = () => {
    setMessage(preve => {
      return {
        ...preve,
        videoUrl: ""
      }
    })
  }

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit('message-page', params.userId);
      socketConnection.emit('seen', params.userId);

      socketConnection.on('message-user', (data) => {
        setDataUser(data);
      });

      socketConnection.on('message', (data) => {
        setAllMessage(data);

        // Filter out messages that are sent by the other user (not the current user)
        const messagesBySender = data.filter(
          (msg) => msg.msgByUserId !== user?._id
        );

        // Find the last message from the other user
        const lastMessageFromSender = messagesBySender[messagesBySender.length - 1];

        if (lastMessageFromSender) {
          const lastMessageTime = new Date(lastMessageFromSender.createdAt).getTime();

          // Update the last message time for the other participant
          setSenderLastMessageTime(lastMessageTime);
        }
      });

      // Cleanup the event listener when the component is unmounted
      return () => {
        socketConnection.off('message-user');
        socketConnection.off('message');
      };
    }
  }, [socketConnection, params?.userId, user]);



  const handleOnChange = (e) => {
    const { name, value } = e.target

    setMessage(preve => {
      return {
        ...preve,
        text: value
      }
    })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()

    if (message.text || message.imageUrl || message.videoUrl) {
      if (socketConnection) {
        socketConnection.emit('new message', {
          sender: user?._id,
          receiver: params.userId,
          text: message.text,
          imageUrl: message.imageUrl,
          videoUrl: message.videoUrl,
          msgByUserId: user?._id
        })
        setMessage({
          text: "",
          imageUrl: "",
          videoUrl: ""
        });

        // Update the last message time when a new message is sent
        setSenderLastMessageTime(Date.now());
      }
    }
  }


  return (
    // className='bg-[#3A4259]'
    <div className='bg-[#343b50] backdrop-blur-md'>
      <header className='sticky top-0 h-16 flex justify-between items-center px-4 bg-[#343b50]/50 backdrop-blur-md'>
        <div className='flex items-center gap-4 transition-all hover:text-white'>
          <Link to={"/"} className='lg:hidden'>
            <FaAngleLeft size={25} />
          </Link>
          <div>
            <Avatar
              width={40}
              height={40}
              imageUrl={dataUser?.profile_pic}
              name={dataUser?.name}
              userId={dataUser?._id}
            />
          </div>
          <div className='flex flex-col gap-1'>
            <h3 className='font-semibold text-lg my-0 text-ellipsis line-clamp-1 text-white'>
              {dataUser?.name}
            </h3>
            <div className='-my-2 text-sm flex items-center gap-1'>
              <span
                className={`w-2.5 h-2.5 rounded-full ${dataUser?.online ? 'bg-green-500' : 'bg-yellow-500'}`}
              ></span>
              {dataUser.online ? (
                <span className='text-slate-400'>online</span>
              ) : (
                <span className='text-slate-400'>Away for {awayTime}</span>
              )}
            </div>
          </div>
        </div>

        <div className='flex items-center gap-6'>
          <button className='text-white hover:text-primary cursor-pointer'>
            <FaPhoneAlt />
          </button>
          <button className='text-white hover:text-primary cursor-pointer'>
            <FaVideo />
          </button>
          <button className='text-white hover:text-primary cursor-pointer'>
            <FaThumbtack />
          </button>
          <button className='text-white hover:text-primary cursor-pointer'>
            <HiDotsVertical />
          </button>
        </div>
      </header>


      {/***show all message */}
      <section className='h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative bg-[#3A4259]'>

        {/* Message Starting Container */}
        
        {/* Message Starting Container */}


        {/** all messages show here */}
        <div className='flex flex-col gap-2 py-2 mx-2' ref={currentMessage}>
          {
            allMessage.map((msg, index) => {
              const isSender = user._id === msg?.msgByUserId; // Check if the current user is the sender
              const previousMsg = allMessage[index - 1];
              const showAvatar = !previousMsg || previousMsg?.msgByUserId !== msg?.msgByUserId;

              return (
                <div key={index} className={`flex items-start gap-4 ${isSender ? 'ml-auto flex-col-reverse' : 'mr-auto flex-col'}`}>
                  {/* Render Avatar only for the first message in a sequence from the same sender */}
                  {showAvatar && !isSender && (
                    <div className='flex gap-2'>
                      <Avatar
                        width={40}
                        height={40}
                        imageUrl={dataUser?.profile_pic} // Set a default image
                        name={dataUser?.name}
                        userId={msg?._id}
                      />
                      <div className='flex gap-1 flex-col justify-start items-start'>
                        <h3 className='font-semibold text-lg items-center my-0 text-ellipsis line-clamp-1 text-white'>
                          {dataUser?.name}
                        </h3>
                        <p className='-my-2 text-xs flex items-center gap-1'>
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${dataUser?.online ? 'bg-green-500' : 'bg-yellow-500'}`}
                          ></span>
                          {dataUser.online ? (
                            <span className='text-slate-400'>online</span>
                          ) : (
                            <span className='text-slate-400'>Away for {awayTime}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  )
                  }

                  {/* Message container */}
                  < div className={`p-2 rounded-lg w-fit text-white mr-0 max-w-[280px] md:max-w-sm lg:max-w-md ${isSender ? "bg-[#2D3345] w-full" : "bg-[#4565FF] ml-0"}`}>
                    <div className='w-full relative'>
                      {
                        msg?.imageUrl && (
                          <img
                            src={msg?.imageUrl}
                            className='w-full h-full object-scale-down'
                          />
                        )
                      }
                      {
                        msg?.videoUrl && (
                          <video
                            src={msg.videoUrl}
                            className='w-full h-full object-scale-down'
                            controls
                          />
                        )
                      }
                    </div>
                    <p className='px-2'>{msg.text}</p>
                    <p className='text-xs ml-auto w-fit'>{moment(msg.createdAt).format('hh:mm')}</p>
                  </div>

                  {/* Render sender's avatar only for the first message in a sequence */}
                  {showAvatar && isSender && (
                    <div className={`flex gap-2 ${isSender ? 'w-full justify-end' : ''}`}>
                      <div className='flex gap-1 flex-col justify-center items-end'>
                        <h3 className='font-semibold text-lg items-center my-0 text-ellipsis line-clamp-1 text-white'>
                          {user?.name}
                        </h3>
                      </div>
                      <Avatar
                        width={40}
                        height={40}
                        imageUrl={user?.profile_pic}
                        name={dataUser?.name}
                        userId={dataUser?._id}
                      />
                    </div>

                  )}
                </div>
              );
            })
          }
        </div >



        {/**upload Image display */}
        {
          message.imageUrl && (
            <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
              <div className='bg-white p-3'>
                <div className='w-fit p-2 absolute cursor-pointer text-gray-500 hover:text-sky-900' onClick={handleClearUploadImage}>
                  <IoClose size={26} />
                </div>
                <img
                  src={message.imageUrl}
                  alt='uploadImage'
                  className='aspect-[5/4] w-full h-full max-w-sm m-2 object-scale-down'
                />
                <button className='text-primary relative left-[91%] hover:text-secondary' onClick={handleSendMessage}>
                  <IoMdSend size={28} />
                </button>
              </div>
            </div>
          )
        }

        {/**upload video display */}
        {
          message.videoUrl && (
            <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
              <div className='w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600' onClick={handleClearUploadVideo}>
                <IoClose size={30} />
              </div>
              <div className='bg-white p-3'>
                <video
                  src={message.videoUrl}
                  className='aspect-square w-full h-full max-w-sm m-2 object-scale-down'
                  controls
                  muted
                  autoPlay
                />
              </div>
            </div>
          )
        }

        {
          loading && (
            <div className='w-full h-full flex sticky bottom-0 justify-center items-center'>
              <Loading />
            </div>
          )
        }
      </section >

      {/**send message */}
      < section className='h-16 flex items-center px-4 force-blur' >
        <div className='flex gap-1'>
          <button onClick={handleUploadImageVideoOpen} className='text-gray-400 hover:text-gray-300 mr-2'>
            <FaPlus size={20} />
          </button>

          {/** Emoji icon (next to Plus) */}
          <button type='button' className='text-gray-400 hover:text-gray-300 mr-2'>
            <IoMdHappy size={24} /> {/** Emoji icon size */}
          </button>

          {/**video and image */}
          {
            openImageVideoUpload && (
              <div className='bg-white shadow rounded absolute bottom-14 w-36 p-2'>
                <form>
                  <label htmlFor='uploadImage' className='flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer'>
                    <div className='text-primary'>
                      <FaImage size={18} />
                    </div>
                    <p>Image</p>
                  </label>
                  <label htmlFor='uploadVideo' className='flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer'>
                    <div className='text-purple-500'>
                      <FaVideo size={18} />
                    </div>
                    <p>Video</p>
                  </label>

                  <input
                    type='file'
                    id='uploadImage'
                    onChange={handleUploadImage}
                    className='hidden'
                  />

                  <input
                    type='file'
                    id='uploadVideo'
                    onChange={handleUploadVideo}
                    className='hidden'
                  />
                </form>
              </div>
            )
          }

        </div>

        {/**input box */}
        <form className='h-full w-full flex gap-2' onSubmit={handleSendMessage}>
          <input
            type='text'
            placeholder='Type a message...'
            className='flex-grow py-2 px-4 outline-none bg-transparent text-white placeholder-gray-400'
            value={message.text}
            onChange={handleOnChange}
          />
          <button className='text-cyan-400 hover:text-cyan-500'>
            <IoMdSend size={28} />
          </button>
        </form>

      </section >



    </div >
  )
}

export default MessagePage
