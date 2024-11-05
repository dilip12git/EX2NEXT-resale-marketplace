import { useNavigate } from 'react-router-dom';
import './styles.css';
import logo from '../assets/icon/logo.png';
import { useState,useEffect } from 'react';
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { useToast } from '../components/contexts/ToastService';
import { useAuth } from '../components/contexts/AuthContext';

function Forgot() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const [errors, setErrors] = useState({});
    const [generatedOTP, setGeneratedOTP] = useState('');
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [showPopup, setShowPopup] = useState(false);
    const [otpMatch, setOtpMatch] = useState(false);
    const {notifyError,notifySuccess}=useToast();
    const {isAuthenticated}=useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/')
        }
    },[]);

    const gotoHome = () => {
        navigate('/');
    }
   
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
    const handleSubmit = async (event) => {
        event.preventDefault();

        const newErrors = {};
        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Invalid email address';
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        try {
            const otpResponse = await checkOTP(email);
            if (otpResponse && otpResponse.data.otp) {
                setGeneratedOTP(otpResponse.data.otp);
                setShowPopup(true);
             
            } else {
                notifyError(otpResponse.data.message);

            }
        } catch (err) {
            console.error(err);
        }
    };
    const handleOTPSubmit = async (event) => {
        event.preventDefault();
        const otpString = otp.join("");
        if (otp.some((digit) => digit === "")) {
            setErrors({ otp: "Incorrect OTP !" });
            return;
        }
        if (otpString === generatedOTP) {
            setOtpMatch(true);

            setTimeout(() => {
                setShowPopup(false);
                setOtp(new Array(6).fill(""));
                setOtpMatch(false);
                navigate('/update-password',{ state: email })
            }, 2000);


        } else {
            setErrors({ otp: "OTP does not match" });
        }
    };
    const checkOTP = async (email) => {
        if (email) {
            try {
                const response = await fetch('http://localhost:5000/users/auth/sendResetPassOTP', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                });
                const data = await response.json();
                return { data };
            } catch (err) {
                throw err;
            }
        }
        else {
            notifyError("try again")
        }
    };

    return (
        <div className='sign-container'>
            <div className='form-container'>
                <div className='title-container'>
                    <div className='auth-logo-container' onClick={gotoHome}>
                        <img className='logo-icon' src={logo} alt='logo' />
                    </div>
                    <span className='sign-with'>Reset Password</span>
                </div>
              
                <form onSubmit={handleSubmit} className='sign-form'>
                    <div className='input-wrapper'>
                        <label>Enter your email address</label>
                        <input
                            type='text'
                            className='inputField'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}

                        />
                        {errors.email && <span className='error'>{errors.email}</span>}
                    </div>

                    <div className='input-wrapper'>
                        <input type='submit' className='inputField' value='Reset Password' />
                    </div>

                </form>
            </div>
            {/* OTP Popup */}
            {showPopup && (
                <div className="opt-container">
                    {!otpMatch ? (
                        <div className='opt-wrapper'>
                            <div className='verified-icon'>
                                <IoShieldCheckmarkSharp className='vcheck-icon' />
                            </div>
                            <span className='enter-otp-text'>OTP Verification</span>
                            <span className='otp-desc-txt'>OTP has been successfully sent to your email.</span>
                            <form onSubmit={handleOTPSubmit}>
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

                                <div className='resend-otp-txt' onClick={handleSubmit}>Resend OTP</div>

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

            )}
        </div>
    );
}

export default Forgot;