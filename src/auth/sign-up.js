import { useState, useEffect } from 'react';
import './styles.css';
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/icon/logo.png'
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { LuEye, LuEyeOff, } from "react-icons/lu";
import { ClipLoader } from 'react-spinners';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import { useLocation } from '../components/contexts/LocationContext';
import { useAuth } from '../components/contexts/AuthContext';

function SignUp() {
    const navigate = useNavigate();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [countryCode, setCountryCode] = useState('in');
    const { currentLocation } = useLocation();
    const {
        email,
        setEmail,
        phoneNumber,
        setPhoneNumber,
        password,
        setPassword,
        name,
        setName,
        otp,
        setOtp,
        showPopup,
        otpMatch,
        isLoading,
        verifyOtp,
        handleGoogleSignUp,
        handleSignUp,
        errors,
        user,
        isAuthenticated
    } = useAuth();

    useEffect(() => {
        if (currentLocation) {
            setCountryCode(currentLocation.countryCode);
        }
    }, [currentLocation])

   
    useEffect(() => {
        if (isAuthenticated)
            navigate('/');
    }, [isAuthenticated, user])

    const gotoHome = () => {
        navigate('/')
    }
    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const handleChange = (element, index) => {
        const value = element.value.replace(/[^0-9]/g, '');
        if (value.length <= 1) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            if (element.nextSibling && value) {
                element.nextSibling.focus();
            }
        }
    };
    const handleKeyDown = (event, index) => {
        if (event.key === "Backspace" && otp[index] === "" && event.target.previousSibling) {
            event.target.previousSibling.focus();
        }
    };

  

    return (
        <div className='sign-container'>
            <div className='form-container'>
                <div className='title-container'>
                    <div className='auth-logo-container' onClick={gotoHome}>
                        <img className='logo-icon' src={logo} alt='logo' />
                    </div>
                    <span className='sign-with'>Sign Up</span>
                </div>
                <form onSubmit={handleSignUp} className='sign-form'>
                    <div className='input-wrapper'>
                        <label>Name</label>
                        <input type='text' className='inputField'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        {errors.name && <span className='error'>{errors.name}</span>}
                    </div>
                    <div className='input-wrapper'>
                        <label>Email Address</label>
                        <input type='email' className='inputField'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && <span className='error'>{errors.email}</span>}
                    </div>
                    <div className='input-wrapper'>
                        <label>Phone number</label>
                        <PhoneInput
                            country={countryCode}
                            value={phoneNumber}
                            onChange={(phone) => setPhoneNumber(`+${phone}`)}
                            containerStyle={{
                                borderRadius: '10px',
                                border: '1px solid #ddd',
                                width: '100%',
                                padding: '3px 0px'
                            }}
                            buttonStyle={{
                                border: 'none',
                                borderRadius: '10px',
                                background: 'transparent',

                            }}
                            inputStyle={{
                                border: 'none',
                                width: '100%'

                            }}
                        />
                        {errors.phoneNumber && <span className='error'>{errors.phoneNumber}</span>}
                    </div>
                    <div className='input-wrapper'>
                        <div className='password-label-wrapper'>
                            <label>Create password</label>

                        </div>
                        <div className='pass-input'>
                            <input
                                type={isPasswordVisible ? 'text' : 'password'}
                                className='inputField'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <div className='eye-icon' onClick={togglePasswordVisibility}>
                                {isPasswordVisible ? <LuEye /> : <LuEyeOff />}
                            </div>
                        </div>
                        {errors.password && <span className='error'>{errors.password}</span>}
                    </div>

                    <div className='input-wrapper'>
                        <input type='submit' className='inputField' value='Sign Up' />
                    </div>

                    <div className='new-acc-wrapper'>
                        <span className='newtoNextHand'>Already have an account?</span>
                        <Link className='create-acc-link' to='/sign-in'>Sign In</Link>
                    </div>

                </form>
                <div className='separator-container'>
                    <div className='line'></div>
                    <div className='or-text'>OR</div>
                    <div className='line'></div>
                </div>
                <div className='sign-with-google-container' onClick={handleGoogleSignUp}>
                    <FcGoogle className='google-icon' />
                    <span className='sign-with-google'>Continue with Google</span>
                </div>
            </div >

            {/* OTP Popup */}
            {
                showPopup && (
                    <div className="opt-container">
                        {!otpMatch ? (
                            <div className='opt-wrapper'>
                                <div className='verified-icon'>
                                    <IoShieldCheckmarkSharp className='vcheck-icon' />
                                </div>
                                <span className='enter-otp-text'>OTP Verification</span>
                                <span className='otp-desc-txt'>OTP has been successfully sent to your email.</span>
                                <form onSubmit={verifyOtp}>
                                    <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                type="text"
                                                maxLength="1"
                                                value={digit}
                                                onChange={(e) => handleChange(e.target, index)}
                                                onKeyDown={(e) => handleKeyDown(e, index)}
                                                onFocus={(e) => e.target.select()}

                                            />
                                        ))}
                                    </div>
                                    {errors.otp && <span style={{ color: "red", fontSize: "12px" }}>{errors.otp}</span>}
                                    <button type="submit" style={{ marginTop: "20px" }}>
                                        Verify OTP
                                    </button>

                                    <div className='resend-otp-txt' onClick={handleSignUp}>Resend OTP</div>

                                </form>
                            </div>
                        ) : (
                            <div className='opt-wrapper'>
                                <div className='verified-icon'>
                                    <IoShieldCheckmarkSharp className='vcheck-icon' />
                                </div>
                                <span className='enter-otp-text'>Verified</span>
                            </div>

                        )}
                    </div>

                )
            }
            {
                isLoading && (
                    <div className='loading-animation-container'>
                        <div className='loading-animation'>
                            <ClipLoader
                                color="#0066FF"
                                loading
                                size={19}
                            />
                            <span>Sign up...</span>
                        </div>
                    </div>
                )
            }


        </div >

    );

}

export default SignUp;