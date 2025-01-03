import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

export const AuthRoute = () => {
  const { user } = useUser();

  if (!user || !user.hasLinkedBankAccount) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
