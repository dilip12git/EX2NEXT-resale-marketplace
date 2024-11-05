import React from 'react';
import './styles.css';
import { useNavigate } from 'react-router-dom'
import { ReactComponent as SignInSVG } from '../assets/SVG/sign-in-svg.svg';

function AuthPopup({ isClosed }) {
    const navigate = useNavigate();
    return (
        <div className='auth-popup'>
              <SignInSVG width={120} height={120} style={{ alignSelf: 'center' }} />
            <span style={{marginTop:'-20px'}}>Please sign in to continue accessing your personalized content.</span>
            <div className='auth-btn-wrapper'>
                <button className='close-auth-popup' style={{ background: 'transparent',border:'1px solid whitesmoke',color:'grey' }} onClick={() => isClosed(false)}>Cancel</button>
                <button className='close-auth-popup' onClick={() => navigate('/sign-in')}>Sign In</button>
            </div>
        </div>
    )
}

export default AuthPopup
