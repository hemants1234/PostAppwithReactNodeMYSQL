import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
//import {NavLink} from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/authSlice.js';


function Header() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('LoginUser'));
    
    let role = user?.role || null;
    let imgurl = user?.coverImage || null;
    let data = localStorage.getItem('user-info');
   // let fbData = localStorage.getItem('fb-user-info');

    let userData = JSON.parse(data);
    if(!user){
        imgurl= userData?.image || null;
        role = userData.role || null;
    }
    console.log(userData);
    

    const logoutFn = async () => {
        console.log("hello")
        
        const result = await dispatch(logoutUser());
        console.log(result);
        navigate('/login');
        // if (loginUser.fulfilled.match(result)) {
        //   navigate('/post-list');
        // }
    }
    // if login by user he will not able to perform any action here
    console.log(user);
    return (
        <>
            <header className="bg-gray-800 text-white p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <div className='flex flex-row'>
                        <img src={imgurl} alt="Logo" className="header-logo w-8 rounded-xl h-8" /> <span onClick={() => logoutFn()} className='ml-4 cursor-pointer hover:text-blue-600'>LogOut</span>
                    </div>
                    <span className='text-lg'>this is {role} board</span>
                    <nav>
                        <ul className="flex space-x-4">
                            <li>
                                <NavLink
                                    to="/post-list"
                                    className={({ isActive }) =>
                                        ` ${isActive ? "text-yellow-200" : "text-white"}`
                                    }
                                >
                                    Posts List
                                </NavLink>
                            </li>
                            {
                                role !== 'admin' ? <li></li> : <li>
                                    <NavLink
                                        to="/post-create"
                                        className={({ isActive }) =>
                                            ` ${isActive ? "text-yellow-200" : "text-white"} `
                                        }
                                    >
                                        Create List
                                    </NavLink>
                                </li>
                            }

                        </ul>
                    </nav>
                </div>
            </header>
        </>
    )
}

export default Header;
