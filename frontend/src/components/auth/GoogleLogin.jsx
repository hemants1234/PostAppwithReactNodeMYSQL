//import {useState} from "react";
import { FaGoogle } from 'react-icons/fa';
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "./../../api.js";
import { useDispatch, useSelector } from 'react-redux';
import { loginWithGoogle } from '../../redux/authSlice.js';
import { useNavigate } from 'react-router-dom';

const GoogleLogin = (props) => {
	//const [user, setUser] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { user, status, error } = useSelector((state) => state.auth);

	//const navigate = useNavigate();
	const responseGoogle = async (authResult) => {
		console.log(authResult["code"]);
		try {
			if (authResult["code"]) {
              
				const result = await dispatch(loginWithGoogle(authResult["code"]));
                if (loginWithGoogle.fulfilled.match(result)) {
                      navigate('/post-list');
                    }
				console.log("inside if result", result);
                let image = result.payload.UserData.coverImage;
			
			//	localStorage.setItem('token', token);
			} else {
				console.log(authResult);
				throw new Error(authResult);
			}
		} catch (e) {
			console.log('Error while Google Login...', e);
		}
	};

	const googleLogin = useGoogleLogin({
		onSuccess: responseGoogle,
		onError: responseGoogle,
		flow: "auth-code",
	});

	return (
		<div className="App">
			<button
				onClick={googleLogin}
				className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-xl p-3 shadow hover:shadow-md transition"
			>
				<FaGoogle className="text-red-500 text-lg" />
				<span className="text-sm font-medium text-gray-700">Continue with Google</span>
			</button>
		</div>
	);
};

export default GoogleLogin;