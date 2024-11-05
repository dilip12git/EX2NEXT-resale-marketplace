import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './style.css';
import { useToast } from '../contexts/ToastService';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '../contexts/AuthContext';
import userIcon from '../../assets/icon/user-icon.png'
import CryptoService from '../../services/encryptDecryptService';
function EditProfile() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    userId: "",
    profile: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const { isAuthenticated, user,setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { notifyError, notifySuccess, notifyWarning } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      setFormData(user);
      setPreviewImage(user.profile);
    }

  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    setIsLoading(true)
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('phoneNumber', formData.phoneNumber);
    data.append('userId', formData.userId);

    if (profileImage) {
      data.append('profileImage', profileImage);
    }

    fetch('http://localhost:5000/users/auth/update-user', {
      method: 'PUT',
      body: data,

    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data.user) {
          setIsLoading(false);
          notifySuccess(data.message);
          const encryptedUserData = CryptoService.encryptData(data.user);
          localStorage.setItem('userData', JSON.stringify(encryptedUserData));

          // const decryptData=CryptoService.decryptData(JSON.parse(localStorage.getItem('userData')));
          setUser(data.user);

        }
      })
      .catch((error) => notifyError(error));
  };


  const handleProfileImageError = (event) => {
    event.target.src = userIcon;
  }
  return (
    <div className="edi-profile-container">
      <div className="edi-profile-img-container">
        <img src={previewImage} onError={handleProfileImageError} alt="Profile" width={150} height={150} className="edi-profile-img" onClick={() => document.querySelector('.edi-profile-file-input').click()} />
        <input type="file" accept="image/*" onChange={handleImageChange} className="edi-profile-file-input" />
        <button type="button" onClick={() => document.querySelector('.edi-profile-file-input').click()} className="edi-profile-button">
          Select profile picture
        </button>
      </div>

      <form onSubmit={handleSubmit} className="edi-profile-form">
        <label className="edi-profile-label">User ID:</label>
        <input type="text" name="userId" value={formData.userId} disabled className="edi-profile-input" />

        <label className="edi-profile-label">Email:</label>
        <input type="email" name="email" value={formData.email} disabled className="edi-profile-input" />

        <label className="edi-profile-label">Name:</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="edi-profile-input" />

        <label className="edi-profile-label">Phone Number:</label>
        <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required className="edi-profile-input" />
        <button type="submit" className="edi-profile-submit-button" disabled={isLoading}>{isLoading?<span><ClipLoader size={12} color='white' /> Updating...</span>:<span>Update Profile</span>}</button>
      </form>
    </div>
  );
};

export default EditProfile;