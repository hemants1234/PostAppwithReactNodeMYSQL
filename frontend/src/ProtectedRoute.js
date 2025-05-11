import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
 console.log("auth is or not", isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
