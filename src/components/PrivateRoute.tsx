
import React from 'react';

interface PrivateRouteProps {
  children: React.ReactNode;
}

// Simplified PrivateRoute that no longer checks authentication
const PrivateRoute = ({ children }: PrivateRouteProps) => {
  return <>{children}</>;
};

export default PrivateRoute;
