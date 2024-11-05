import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import SignIn from './auth/sign-in';
import Wrapper from './components/wrapper';
import Home from './components/home/home';
import Chat from './components/chat/chat';
import Notifications from './components/notification/notification';
import SignUp from './auth/sign-up';
import Forgot from './auth/forgot';
import UpdatePassword from './auth/updatePassword'
import ProductDetails from './components/Sell/ProductDetails';
import ProfileWrapper from './components/user-profile/profile-wrapper';
import Profile from './components/user-profile/profile';
import Wishlist from './components/user-profile/wishlist';
import { ReactComponent as EnableLocationSvg } from './assets/SVG/enable-location.svg'
import { ClipLoader } from 'react-spinners';
import { ToastContainer } from 'react-toastify';
import { useLocation } from './components/contexts/LocationContext';
import Loader from './Loader';
import Item from './components/Item-viewer/item';
import EditPost from './components/user-profile/edit-post/edit-post';
import EditProfile from './components/user-profile/edit-profile';
import Search from './components/search/search'
import ScrollToTop from "./ScrollToTop";
function App() {
  const {error, isLoading, handleRetry,setCurrentLocation,setCoordinates,fetchLocation } = useLocation();
  const[isAppLoading, setIsAppLoading]=useState(true);

  useEffect(()=>{
   setTimeout(() => {
    setIsAppLoading(false);
   }, 3000);
  },[])

  return (
    <Router>
      <div className="App">
      <ScrollToTop />
        <ToastContainer />
        {isAppLoading ? (
          <Loader />
        ) : (
          <>
        <Routes>
          <Route path="/" element={<Wrapper />} >
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path='/item/:url' element={<Item/>}/>
            <Route path="/account" element={<ProfileWrapper />}>
              <Route index element={<Profile />} />
              <Route path='profile' element={<Profile />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="edit-profile" element={<EditProfile />} />
              <Route path="edit-product-item" element={<EditPost />} />
            </Route>
          </Route>

          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/sell/product-details" element={<ProductDetails />} />
          <Route path="/chat" element={<Chat />} />

        </Routes>
        {error && (
          <div className='app-location-error-container'>
            <div className='app-location-error'>
              <EnableLocationSvg height={130} width={130} style={{ alignSelf: 'center' }} />
              <span style={{ marginTop: '-10px' }}>{error}</span>
              <button onClick={handleRetry} className='app-retry-btn' disabled={isLoading}>{isLoading ? <><span>Loading...</span><ClipLoader color='white' size={8} /></> : 'Retry'}</button>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </Router>
  );
}

export default App;
