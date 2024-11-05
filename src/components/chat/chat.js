import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import userIcon from '../../assets/icon/user-icon.png';
import { CiSearch, CiImageOn, } from "react-icons/ci";
import { PiVideoLight, PiTrashLight } from "react-icons/pi";
import { HiMiniViewfinderCircle } from "react-icons/hi2";
import './chat.css';
import { IoSend, IoEllipsisVertical } from "react-icons/io5";
import { useSocket } from '../contexts/SocketContext';
import { useLocation } from 'react-router-dom';
import { IoHomeOutline, IoCallOutline } from "react-icons/io5";
import { IoMdHeartEmpty, IoMdDownload, IoIosArrowDropdown } from "react-icons/io";
import { MdOutlineAdd } from "react-icons/md";
import { BiMessageRoundedDots, BiCheckDouble } from "react-icons/bi";
import { GrFormAttachment, GrClose, GrAdd } from "react-icons/gr";
import { FaPlay } from "react-icons/fa";
import { HiMiniBars3BottomLeft } from "react-icons/hi2";
import { MdContentCopy } from "react-icons/md";
import { useToast } from '../contexts/ToastService'
import { RiUserForbidLine, RiUserLine } from "react-icons/ri";
import { useAuth } from '../contexts/AuthContext'
import { GoDotFill } from "react-icons/go";


const Chat = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { notifySuccess, notifyError, notifyWarning } = useToast();
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const {
        messages,
        chatList,
        selectedChatUserId,
        setSelectedChatUserId,
        sendMessage,
        fetchChatsLists,
        fetchChatMessages,
        deleteMessage,
        blockUser,
        isUserBlocked,
        isBlockedMe,
        selectedFilePrev,
        setSelectedFilePrev,
        productUrl,
        setProductUrl,
        deleteChat,
        currentUserId,
        isCallbackRequest,
        setIsCallBackRequest,
        sendCallbackRequest,
        setSelectedUser,
        selectedUser,
        chatId,
        isChatListLoading,
        markMessagesAsSeen,
        isRequesting,
        activeUsers
    } = useSocket();
    const [msgData, setMsgData] = useState('');
    const chatBoxRef = useRef(null);
    const location = useLocation();
    const { product } = location.state || {};
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const [showFileOptions, setShowFileOptions] = useState(false);
    const fileOptionsRef = useRef(null);
    const toggleButtonRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [activeInput, setActiveInput] = useState(null);
    const [toOpenFileUrl, setToOpenFileUrl] = useState(null)
    const [isChatlistActive, setIsChatlistActive] = useState(false);
    const chatListRef = useRef(null);
    const [activeMessageId, setActiveMessageId] = useState(null);
    const messageRefs = useRef({});
    const userInfoRef = useRef(null);
    const chatoptionRef = useRef(null);
    const togglechatOptRef = useRef(null);
    const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
    const [isOpenChatOptions, setIsOpenChatOptions] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');



    useEffect(() => {
        // console.log(product)
        return () => {
            setSelectedChatUserId(null)
        }
    }, [])


    const handleSendMessage = async () => {
        let fileUrl = '';
        if (selectedFile && selectedFilePrev) {
            fileUrl = await uploadFile();
        }
        if (selectedChatUserId) {
            const fileToSend = fileUrl || selectedFilePrev;

            if (fileToSend || msgData.trim()) {
                await sendMessage(selectedChatUserId, msgData, fileToSend, productUrl);
                setMsgData('');
                document.querySelector('.chat-input-box').style.height = 'auto';
                fetchChatsLists();
                clearProduct();
                setSelectedFilePrev(null);
                setProductUrl(null);
            }
        }
    };


    useEffect(() => {
        if (currentUserId) fetchChatsLists();
    }, [currentUserId]);

    useEffect(() => {
        if (selectedChatUserId) {
            fetchChatMessages(selectedChatUserId);
        }

    }, [selectedChatUserId]);

    useEffect(() => {
        if (selectedChatUserId && chatId) {
            markMessagesAsSeen(chatId);
        }

    }, [selectedChatUserId, chatId]);


    const uploadFile = async () => {
        if (!selectedFile) {
            console.error('No file selected for upload');
            return;
        }

        const formData = new FormData();
        formData.append('senderId', currentUserId);
        formData.append('file', selectedFile);

        try {
            const res = await fetch('http://localhost:3001/upload-file', {
                method: 'POST',
                body: formData,
            });

            const result = await res.json();
            if (res.ok) {
                removeSelectedFile()
                return result.fileUrl;
            } else {
                console.error('Error uploading file:', result.message);
            }
        } catch (error) {
            console.error('Error uploading file', error);
        }
    };


    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setActiveInput(event.target.name);
        if (file && file.size > 30 * 1024 * 1024) {
            notifyWarning("File size exceeds 30MB. Please select a smaller file.");
            setSelectedFilePrev(null);
            setSelectedFile(null);
            fileInputRef.current.value = '';
        } else {
            const fileUrl = URL.createObjectURL(file);
            setSelectedFilePrev(fileUrl);
            setSelectedFile(file);
        }
    };
    const removeSelectedFile = () => {
        if (activeInput) {
            setSelectedFilePrev(null);
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }


    };
    const handleDownload = () => {
        fetch(toOpenFileUrl)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Ex2next-download';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            });
    };

    const copyMsg = (msg) => {
        navigator.clipboard.writeText(msg)
            .then(() => {
                notifySuccess('Message copied to clipboard');
            })
            .catch((err) => {
                notifyError('Failed to copy message: ' + err);
            });
    };


    const handleChatClick = (chat, userDetail) => {
        setSelectedChatUserId(chat.peerId);
        fetchChatMessages(chat.peerId);
        const data = {
            ...userDetail,
            date: chat.timestamp
        }
        setSelectedUser(data);

    };



    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (product && product.userId) {
            const pDetails = `${product.category}-${product.title}`
                .replace(/[\s,]+/g, '-');
            const url = `/item/${pDetails}-pid-${product.productId}`;
            setProductUrl(url);
            setSelectedChatUserId(product.userId);
            setSelectedFilePrev(product.images[0]);
            setSelectedUser(product.user)

            const separator = " | ";
            const productDetails = `${product.price}${separator}${product.title}${separator}${product.description}`;
            setMsgData(productDetails)
        }

    }, [product]);


    const clearProduct = () => {
        navigate('/chat', {
            replace: true,
            state: {}
        });
    };


    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!e.shiftKey) handleSendMessage();
            e.target.style.height = 'auto';
        } else if (e.key === 'Enter' && e.shiftKey) {
            e.target.style.height = `${e.target.scrollHeight}px`;
        }
    };
    const openItem = (url) => {
        if (url)
            window.open(url, '_blank');
            // navigate(url);
    }
    const handleChatListToggle = () => {
        setIsChatlistActive(prev => !prev);
    };


    useEffect(() => {
        if (!product)
            setIsChatlistActive(true);
    }, []);

    const toggleSelectedUserProfile = () => {
        setIsUserProfileOpen(prev => !prev);
    }
    const toggleOpenChatOptions = () => {
        setIsOpenChatOptions(prev => !prev);
    }
    const handleProfileImageError = (event) => {
        event.target.src = userIcon;
    };

    const toggleFileOptions = () => {
        setShowFileOptions((prevState) => !prevState);
    };
    const handleDoubleClick = () => {
        setScale(prevScale => (prevScale === 1 ? 2 : 1));
    };

    const toggleShowMessageOption = (messageId) => {
        setActiveMessageId((prevId) => (prevId === messageId ? null : messageId));
    };
    const toggleCallbackRequest = () => {
        setIsCallBackRequest(prevState => !prevState);
    }
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                fileOptionsRef.current &&
                !fileOptionsRef.current.contains(event.target) &&
                toggleButtonRef.current &&
                !toggleButtonRef.current.contains(event.target)
            ) {
                setShowFileOptions(false);
            }

            if (activeMessageId !== null) {
                const currentMessageRef = messageRefs.current[activeMessageId];
                if (currentMessageRef && !currentMessageRef.contains(event.target)) {
                    setActiveMessageId(null);
                }
            }

            if (chatListRef.current && !chatListRef.current.contains(event.target)) {
                setIsChatlistActive(false);
            }

            if (
                chatoptionRef.current &&
                !chatoptionRef.current.contains(event.target) &&
                togglechatOptRef.current &&
                !togglechatOptRef.current.contains(event.target)
            ) {
                setIsOpenChatOptions(false);
            }

            if (userInfoRef.current && !userInfoRef.current.contains(event.target)) {
                setIsUserProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeMessageId]);

    const filteredChatList = chatList.filter(({ userDetail }) =>
        userDetail.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className='chat-container'>
            <div className={`chat-aside ${isChatlistActive ? 'aside-active' : ''}`} ref={chatListRef}>
                <div className='chat-top-wrapper'>
                    <div className='chat-header-wrapper'>
                        <div className='chats-header-icon' onClick={() => navigate('/account/profile')}>
                            <img
                                className='chat-header-current-u-profile'
                                src={user ? user.profile : userIcon}
                                alt={user.name}
                                onError={handleProfileImageError}
                                title='Profile'
                            />
                        </div>
                        <div className='chats-header-icon'
                            title='Home'
                            onClick={() => navigate('/')}

                        >
                            <IoHomeOutline className='header-icon' />

                        </div>
                        <div className='chats-header-icon'
                            title='Wishlist'
                            onClick={() => navigate('/account/wishlist')}
                        >
                            <IoMdHeartEmpty className='header-icon' />
                        </div>
                        <div className='chats-header-add-sell'
                            title='Add Sell'
                            onClick={() => navigate('/sell/product-details')}

                        >

                            <MdOutlineAdd className='header-icon' />
                            <span>SELL</span>
                        </div>
                        <div className='chats-header-icon chat-close-icon'
                            title='close'
                            onClick={() => setIsChatlistActive(false)}
                        >
                            <GrClose className='header-icon' />
                        </div>
                    </div>
                    <div className='chat-title-wrapper'><span className='chat-title'>Chats</span></div>
                    <div className='chat-search-wrapper'>
                        <CiSearch className='chat-search-icon' />
                        <input
                            type='text'
                            placeholder='Search chat'
                            className='chat-search-box'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                {isChatListLoading ? (
                    <div className='chat-list'>
                        {Array(5).fill().map((_, index) => (
                            <div key={index} className='chat-list-item'>
                                <div className='chat-list-profile-pic chat-list-skeleton-pic skeleton-animation'></div>
                                <div className='chats-list-item-details skeleton-info-wrapper'>
                                    <div className='chat-list-user-name-and-date'>
                                        <div className='chat-list-user-name chat-list-skeleton-title skeleton-animation'></div>
                                        <div className='chat-list-date chat-list-skeleton-date skeleton-animation'></div>
                                    </div>
                                    <div className='chat-list-last-chat chat-list-skeleton-last-chat skeleton-animation'></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (

                    <div className='chat-list'>
                        {filteredChatList.length > 0 ? (
                            filteredChatList.map(({ chatPartner, userDetail, unseenMessagesCount }, index) => (
                                <div
                                    key={index}
                                    onClick={() => {
                                        handleChatClick(chatPartner, userDetail);
                                        setIsChatlistActive(false);
                                        clearProduct();
                                        setSelectedFilePrev(null);
                                        setSelectedFile(null);
                                        setMsgData('')

                                    }}
                                    className={`chat-list-item ${chatPartner.peerId === selectedChatUserId ? 'chat-list-active' : ''}`}
                                >
                                    <div className='chat-list-profile-wrapper'>
                                        <img
                                            src={userDetail.profile}
                                            alt={`${userDetail.name}'s profile`}
                                            className='chat-list-profile-pic'
                                            onError={handleProfileImageError}
                                        />
                                        {activeUsers.includes(chatPartner.peerId) && (
                                            <div className='chat-list-active-icon'></div>

                                        )}
                                    </div>
                                    <div className='chats-list-item-details'>
                                        <div className='chat-list-user-name-and-date'>
                                            <span className='chat-list-user-name'>{userDetail.name}</span>
                                            <span className='chat-list-date'>{(() => {
                                                const messageDate = new Date(chatPartner.timestamp);
                                                return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            })()}</span>
                                        </div>
                                        <div className='chat-list-user-name-and-date'>
                                            <span className='chat-list-last-chat'>{chatPartner.lastMessage}</span>
                                            {unseenMessagesCount > 0 && (
                                                <div className='unseen-messages-count'>
                                                    {unseenMessagesCount}
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p color='grey' align='center'>No chat partners found.</p>
                        )}

                    </div>
                )}
            </div>
            <>
                {selectedChatUserId ? (
                    <div className='chat-box-wrapper'>
                        <div className='chat-box-header'>
                            <div className='chat-list-menu-icon' onClick={handleChatListToggle}>
                                <HiMiniBars3BottomLeft size={25} color='grey' />
                            </div>
                            <div className='select-chat-user'>
                                <div className='chat-list-profile-wrapper'>
                                    <img src={selectedUser ? selectedUser.profile : userIcon}
                                        alt={selectedUser.name}
                                        onError={handleProfileImageError}
                                        className='chat-box-user-profile'
                                        onClick={toggleSelectedUserProfile}
                                    />
                                    {activeUsers.includes(selectedChatUserId) && (
                                        <div className='chat-list-active-icon'></div>

                                    )}
                                </div>
                                <div className='chat-box-user-info' onClick={toggleSelectedUserProfile}>
                                    <span className='chat-box-user-name'>{selectedUser.name}</span>
                                    <span className='chat-box-user-date'>
                                        {selectedUser.date ? (
                                            (() => {
                                                const messageDate = new Date(selectedUser.date);
                                                const today = new Date();
                                                if (
                                                    messageDate.getFullYear() === today.getFullYear() &&
                                                    messageDate.getMonth() === today.getMonth() &&
                                                    messageDate.getDate() === today.getDate()
                                                ) {
                                                    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                } else {
                                                    return messageDate.toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    });
                                                }
                                            })()
                                        ) : (
                                            new Date().toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })
                                        )}
                                    </span>
                                </div>
                                {isUserProfileOpen && (
                                    <div className='selected-chat-user-info-wrapper' ref={userInfoRef}>
                                        <div className='selected-user-profile'>
                                            <img className='selected-user-profile-img' src={selectedUser ? selectedUser.profile : userIcon} onError={handleProfileImageError} />
                                        </div>
                                        <div className='selected-user-profile-name'>
                                            <span className='selected-user-name'>{selectedUser.name}</span>
                                            <span className='selected-user-email'>{selectedUser.email}</span>
                                        </div>
                                        <button className='selected-user-send-callback-btn' onClick={toggleCallbackRequest}>Request Callback</button>
                                        <div className='selected-user-phone-number-wrapper'>
                                            <span className='selected-user-phone-number-label'>Phone number</span>
                                            <span className='selected-user-phone-number'>{selectedUser.phoneNumber}</span>
                                        </div>
                                        <div className='selected-user-block-report-btn-wrapper'>
                                            <button className='selected-user-block-btn' onClick={blockUser}>{isBlockedMe ? <span>Unblock</span> : <span>Block</span>}</button>
                                            <button className='selected-user-report-btn'>Report</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className='chat-box-opt'>
                                <IoCallOutline size={18} className='chat-box-call-icon chat-box-opt-icon' onClick={toggleCallbackRequest} />
                                <div ref={togglechatOptRef} onClick={toggleOpenChatOptions} className='chat-box-opt-icon'>
                                    <IoEllipsisVertical size={18} />
                                </div>

                                {isOpenChatOptions && (<div className='chat-box-opt-wrapper' ref={chatoptionRef}>
                                    <div className='chat-box-opt-item'
                                        onClick={() => {
                                            navigate('/');
                                            setIsOpenChatOptions(false);
                                        }}>
                                        <IoHomeOutline size={18} />
                                        <span>Home</span>
                                    </div>
                                    <div className='chat-box-opt-item '
                                        onClick={() => {
                                            navigate('/account/wishlist');
                                            setIsOpenChatOptions(false);
                                        }}>
                                        <IoMdHeartEmpty size={18} />
                                        <span>Wishlist</span>
                                    </div>
                                    <div className='chat-box-opt-item'
                                        onClick={() => {
                                            navigate('/sell/product-details');
                                            setIsOpenChatOptions(false);
                                        }}>
                                        <GrAdd size={18} />
                                        <span>Add sell</span>
                                    </div>

                                    <div className='chat-box-opt-item'
                                        onClick={() => {
                                            blockUser();
                                            setIsOpenChatOptions(false);
                                        }}>
                                        {isBlockedMe ? (
                                            <div className='chat-block-user'>
                                                <RiUserForbidLine size={18} />
                                                <span>Unblock</span>
                                            </div>
                                        ) : (
                                            <div className='chat-block-user'>
                                                <RiUserLine size={18} />
                                                <span>Block</span>
                                            </div>

                                        )}
                                    </div>
                                    <div className='chat-box-opt-item delete-item'
                                        style={{ color: 'red' }}
                                        onClick={() => {
                                            deleteChat();
                                            setIsOpenChatOptions(false);
                                        }}>
                                        <PiTrashLight size={18} />
                                        <span>Delete chat</span>
                                    </div>

                                </div>)}
                            </div>
                        </div>
                        <div className='chat-box' ref={chatBoxRef}>
                            {messages.length ? (
                                <div className='chat-messages-wrapper'>
                                    {messages.map((msg, index) => {
                                        const isCurrentUser = msg.senderId === currentUserId;
                                        const currentDate = new Date(msg.timestamp).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        });
                                        const previousDate = index > 0 ? new Date(messages[index - 1].timestamp).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        }) : null;

                                        return (
                                            <React.Fragment key={index}>
                                                {currentDate !== previousDate && (
                                                    <div className='chats-dates'>
                                                        <em>{currentDate}</em>
                                                    </div>
                                                )}
                                                <div className='chats-messages' style={{ justifyContent: isCurrentUser ? 'flex-end' : 'flex-start' }}>
                                                    <div className='messages'
                                                        ref={(el) => (messageRefs.current[msg._id] = el)}
                                                        style={{
                                                            maxWidth: msg.fileUrl ? '250px' : '',
                                                            padding: msg.fileUrl ? '6px' : '',
                                                            backgroundColor: !isCurrentUser ? '#F5F5F7' : '#0066FF',
                                                            color: !isCurrentUser ? '#333' : 'white',
                                                            cursor: msg.fileUrl ? 'pointer' : ''

                                                        }}>
                                                        {msg.fileUrl && (
                                                            <div className='msg-media-file'
                                                                onClick={() => openItem(msg.productUrl)}
                                                            >
                                                                {msg.fileUrl.endsWith('.jpg') || msg.fileUrl.endsWith('.jpeg')|| msg.fileUrl.endsWith('.svg') || msg.fileUrl.endsWith('.png') || msg.fileUrl.endsWith('.gif') ? (
                                                                    <><img
                                                                        src={msg.fileUrl}
                                                                        className="msg-file"
                                                                        alt='File'
                                                                        loading='lazy'
                                                                    />
                                                                        <div className='msg-hover-icon' onClick={() => setToOpenFileUrl(msg.fileUrl)}>
                                                                            <HiMiniViewfinderCircle size={20} color='white' />
                                                                        </div></>
                                                                ) : msg.fileUrl.endsWith('.mp4') || msg.fileUrl.endsWith('.mkv') || msg.fileUrl.endsWith('.webm') ? (
                                                                    <> <video
                                                                        src={msg.fileUrl}
                                                                        className="msg-file msg-vdo"
                                                                        alt='File'

                                                                    />
                                                                        <div className='msg-hover-icon' onClick={() => setToOpenFileUrl(msg.fileUrl)}>
                                                                            <FaPlay size={20} color='white' />
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <p>Unsupported file type</p>
                                                                )}
                                                            </div>
                                                        )}

                                                        <span className='msg' onClick={() => openItem(msg.productUrl)}>{msg.message}</span>
                                                        {
                                                            msg.productUrl && (() => {
                                                                const url = baseUrl + msg.productUrl;
                                                                return <a
                                                                    href={url}
                                                                    target="_self"
                                                                    rel="noopener noreferrer"
                                                                    className='chat-box-product-url'
                                                                    style={{ color: isCurrentUser ? 'white' : '#0066FF' }}
                                                                >{url}</a>;
                                                            })()
                                                        }
                                                        <em className='chats-messages-time'>
                                                            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            {isCurrentUser && <BiCheckDouble size={20} />}
                                                            {isCurrentUser && (
                                                                <IoIosArrowDropdown
                                                                    size={18}
                                                                    onClick={() => toggleShowMessageOption(msg._id)}
                                                                    style={{ cursor: 'pointer' }}

                                                                />
                                                            )}
                                                        </em>
                                                        {isCurrentUser && activeMessageId === msg._id && (
                                                            <div className="message-options">
                                                                <div className="message-options-item" onClick={() => {
                                                                    copyMsg(msg.message);
                                                                    setActiveMessageId(null);

                                                                }}>
                                                                    <MdContentCopy size={15} />
                                                                    <span className="msg-opt-title">Copy</span>
                                                                </div>

                                                                <div className="message-options-item" style={{ color: 'red' }} onClick={() => deleteMessage(msg._id, msg.senderId)}>
                                                                    <PiTrashLight size={15} />
                                                                    <span className="msg-opt-title">Delete</span>
                                                                </div>
                                                            </div>
                                                        )}

                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p>

                                </p>
                            )}
                        </div>
                        {selectedFilePrev && (
                            <div className='chat-box-selected-image-wrapper'>
                                <div className='file-preview-closer'
                                    onClick={() => {
                                        removeSelectedFile();
                                        clearProduct();
                                        setSelectedFilePrev(null);
                                        setMsgData('');
                                    }}>
                                    <GrClose color='white' size={20} className='viewer-close-icon' />
                                </div>
                                {selectedFile && selectedFile.type.startsWith("image/") ? (
                                    <img src={selectedFilePrev} alt="Preview" className='chat-box-selected-img' />
                                ) : selectedFile ? (
                                    <video className='chat-box-selected-vdo' controls>
                                        <source src={selectedFilePrev} type={selectedFile?.type || "video/"} />
                                        Your browser does not support the video tag.
                                    </video>
                                ) : (
                                    <img src={selectedFilePrev} alt="Preview" className='chat-box-selected-img' />
                                )}
                            </div>
                        )}

                        {!isUserBlocked ? (
                            <div className='chat-input-box-wrapper'>
                                {showFileOptions && (
                                    <div className='chat-box-show-file-choose-opt' ref={fileOptionsRef}>
                                        <div className='ch-file-title'><span>Choose file</span></div>
                                        <div className='chat-box-file-choose-item'>
                                            <label htmlFor='image-upload'>
                                                <CiImageOn className='chat-add-icon' />
                                                <span className='choose-title'>Photo</span>
                                            </label>
                                            <input
                                                id='image-upload'
                                                type='file'
                                                accept='.jpeg, .png, .svg, .jpg'
                                                name="image-file"
                                                ref={fileInputRef}
                                                onChange={(e) => {
                                                    handleFileChange(e);
                                                    setShowFileOptions(false);
                                                }}
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                        <div className='chat-box-file-choose-item'>
                                            <label htmlFor='video-upload'>
                                                <PiVideoLight className='chat-add-icon' />
                                                <span className='choose-title'>Video</span>
                                            </label>
                                            <input
                                                id='video-upload'
                                                type='file'
                                                name="video-file"
                                                accept='video/*'
                                                ref={fileInputRef}
                                                onChange={(e) => {
                                                    handleFileChange(e);
                                                    setShowFileOptions(false);
                                                }}
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className='chat-box-icon' ref={toggleButtonRef} onClick={toggleFileOptions}>
                                    <GrFormAttachment />

                                </div>

                                <textarea
                                    className='chat-input-box'
                                    placeholder='Type message...'
                                    value={msgData}
                                    onChange={(e) => setMsgData(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                />
                                <button
                                    className={`chat-send-btn ${!(msgData.trim() || selectedFilePrev) ? 'disabled' : ''}`}
                                    onClick={handleSendMessage}
                                    disabled={!(msgData.trim() || selectedFilePrev)}
                                >
                                    <span>Send</span>
                                    <IoSend />
                                </button>
                            </div>
                        ) : (
                            <div className='chat-input-box-wrapper'>
                                <div style={{ color: 'red', textAlign: 'center', fontSize: '12px', margin: 'auto' }}>You have been blocked by this user.</div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className='chat-not-selected-wrapper'>
                        <div className='chat-list-menu-icon chat-not-selected-menu-icon' onClick={handleChatListToggle}>
                            <HiMiniBars3BottomLeft size={25} color='grey' />
                        </div>
                        <BiMessageRoundedDots className='chat-not-selected-icon' color='grey' size={50} />
                        <span className='chat-not-selected-msg'>Who would you like to chat with today? Select a user to get started!</span>
                        <span style={{ color: '#0066FF', cursor: 'pointer', fontSize: '12px' }} onClick={handleChatListToggle}>Select a chat</span>
                    </div>
                )}
            </>
            {toOpenFileUrl && (
                <div className='msg-media-file-viewer'>
                    <div className='msg-media-viewer-closer' >
                        <div onClick={handleDownload} className='viewer-download-icon'>
                            <IoMdDownload color='white' size={25} />
                        </div>
                        <GrClose color='white' size={25} className='viewer-close-icon' onClick={() => setToOpenFileUrl(null)} />
                    </div>
                    <div className='msg-media-file-view'>
                        {toOpenFileUrl.endsWith('.jpg') ||
                            toOpenFileUrl.endsWith('.jpeg') ||
                            toOpenFileUrl.endsWith('.png') ||
                            toOpenFileUrl.endsWith('.gif') ? (
                            <img
                                onDoubleClick={handleDoubleClick}
                                src={toOpenFileUrl}
                                className="view-msg-img"
                                alt='File'
                                loading='lazy'
                                style={{
                                    transform: `scale(${scale})`,
                                    transition: 'transform 0.3s ease',
                                    cursor: scale === 1 ? 'zoom-in' : 'zoom-out',
                                }}
                            />
                        ) : toOpenFileUrl.endsWith('.mp4') ||
                            toOpenFileUrl.endsWith('.mkv') ||
                            toOpenFileUrl.endsWith('.webm') ? (
                            <video
                                src={toOpenFileUrl}
                                className="view-vdo-file"
                                alt='File'
                                controls
                                autoPlay

                            />
                        ) : (
                            <p>Unsupported file type</p>
                        )}
                    </div>
                </div>

            )}
            {isCallbackRequest && (
                <div className='call-back-wrapper'>
                    {!isUserBlocked ? (
                        <div className='call-back-popup'>
                            <span className='call-back-title'>Request Number</span>
                            <span className='call-back-desc'>By submitting, you agree to share your name and number with the seller for callback purposes only.</span>
                            <div className='call-back-input-box-wrapper'>
                                <label className='call-back-label'>Full Name</label>
                                <input type='text' className='call-back-input-box' value={selectedUser.name} disabled />
                            </div>
                            <div className='call-back-input-box-wrapper'>
                                <label className='call-back-label'>Phone Number</label>
                                <input type='text' className='call-back-input-box' value={selectedUser.phoneNumber} disabled />
                            </div>
                            <div className='call-back-btn-wrapper'>
                                <button className='call-back-cancel-btn' onClick={() => setIsCallBackRequest(false)}>Close</button>
                                <button
                                    className='call-back-request-btn'
                                    onClick={sendCallbackRequest}
                                    disabled={isRequesting}
                                >{isRequesting ? 'Requesting...' : 'Request Callback'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className='call-back-popup'>
                            <div style={{ color: 'red', fontSize: '16px', }}>User Blocked !!</div>
                            <span style={{ fontSize: '13px', color: 'grey' }}>You have been blocked by this user. Interaction with this user is no longer possible.</span>
                            <div className='call-back-btn-wrapper'>
                                <button className='call-back-cancel-btn' onClick={() => setIsCallBackRequest(false)}>close</button>
                            </div>
                        </div>
                    )
                    }

                </div>
            )}
        </div >
    );
};

export default Chat;
