import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google';
import SocketContext from './components/contexts/SocketContext';
import ToastService from './components/contexts/ToastService';
import { NotificationProvider } from './components/contexts/NotificationContext';
import { WishlistProvider } from './components/contexts/WishlistContext';
import { LocationProvider } from './components/contexts/LocationContext';
import { AuthProvider } from './components/contexts/AuthContext';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="YOUR-GOOGLE-CLIENT-ID">
      <ToastService>
        <LocationProvider>
          <AuthProvider>
            <SocketContext>
                <NotificationProvider>
                  <WishlistProvider>
                    <App />
                  </WishlistProvider>
                </NotificationProvider>
            </SocketContext>
          </AuthProvider>
        </LocationProvider>
      </ToastService>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

reportWebVitals();
