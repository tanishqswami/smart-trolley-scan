
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to the products page instead of home
  return <Navigate to="/products" replace />;
};

export default Index;
