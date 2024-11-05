import { useState, useEffect } from 'react';
import './styles.css';
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/icon/logo.png'
import { LuEye, LuEyeOff, } from "react-icons/lu";
import { ClipLoader } from 'react-spinners';
import { useAuth } from '../components/contexts/AuthContext';
function SignIn() {
    const navigate = useNavigate();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const {
        email,
        setEmail,
        password,
        setPassword,
        isLoading,
        handleGoogleSignIn,
        handleSignIn,
        errors,
        isAuthenticated,
        user
    } = useAuth();

    const gotoHome = () => {
        navigate('/');
    }

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    useEffect(() => {
        if (isAuthenticated)
            navigate('/');
    }, [isAuthenticated, user])

    return (
        <div className='sign-container'>
            <div className='form-container'>
                <div className='title-container'>
                    <div className='auth-logo-container' onClick={gotoHome}>
                        <img className='logo-icon' src={logo} alt='logo' />
                    </div>
                    <span className='sign-with'>Sign In</span>
                </div>
                <form onSubmit={handleSignIn} className='sign-form'>
                    <div className='input-wrapper'>
                        <label>Email Address</label>
                        <input
                            type='text'
                            className='inputField'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}

                        />
                        {errors.email && <span className='error'>{errors.email}</span>}
                    </div>
                    <div className='input-wrapper'>
                        <div className='password-label-wrapper'>
                            <label>Password</label>
                            <Link className='forgot-pass' to='/forgot'>Forgot Password?</Link>
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
                        <input
                            type='submit'
                            className='inputField'
                            value='Sign In'
                        />
                    </div>
                    <div className='new-acc-wrapper'>
                        <span className='newtoNextHand'>New to EX2NEXT?</span>
                        <Link className='create-acc-link' to='/sign-up'>Create an account</Link>
                    </div>
                </form>
                <div className='separator-container'>
                    <div className='line'></div>
                    <div className='or-text'>OR</div>
                    <div className='line'></div>
                </div>
                <div className='sign-with-google-container' onClick={handleGoogleSignIn}>
                    <FcGoogle className='google-icon' />
                    <span className='sign-with-google'>Continue with Google</span>
                </div>
            </div>
            {isLoading && (
                <div className='loading-animation-container'>
                    <div className='loading-animation'>
                        <ClipLoader
                            color="#0066FF"
                            loading
                            size={19}
                        />
                        <span>Sign In...</span>
                    </div>
                </div>
            )}
            {/* <ToastContainer/> */}
        </div>

    );
}

export default SignIn;