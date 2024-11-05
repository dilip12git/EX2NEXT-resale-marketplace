import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './header/header';
import Sidebar from './Sidebar/sidebar';
import { FaInfoCircle, FaTimes } from "react-icons/fa";
import { useAuth } from './contexts/AuthContext';
function Wrapper() {
  const { isAuthenticated, user } = useAuth();
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (user.phoneNumber === "" || user.profile === "") {
        setShowUpdateProfile(true)

      }
      else {
        setShowUpdateProfile(false)

      }
    }
  }, [isAuthenticated, user])

  return (
    <div className='aa-wr'>
      <section className='wrapper-aside-nav-container'>
        <Sidebar />
      </section>
      <section className='wrapper-main-container'>
        <div className='header-container'>
          {showUpdateProfile && (
            <div className='up-profile-msg-container'>
              <div className='up-profile-msg'>
                <FaInfoCircle className='up-icon up-info' />
                <span className='up-profile-msg-text'>Update your profile details</span>
                <button className='up-profile-btn' onClick={() => navigate("/account/edit-profile")}>Update details</button>
              </div>
              <FaTimes className='up-icon x-icon' onClick={() => setShowUpdateProfile(false)} />

            </div>
          )}
          <Header />
        </div>
        <section  className='outlet'>
          <Outlet />
        </section>
      </section>

    </div>
  );
}

export default Wrapper;
