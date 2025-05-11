import axios from 'axios';
//let baseURLs = "http://localhost:3002";
const api = axios.create({
    baseURL: "http://localhost:3002",
    // withCredentials: true,
});


const googleAuth = (code) => api.get(`/api/v1/users/google?code=${code}`, { withCredentials: true });

export {googleAuth}