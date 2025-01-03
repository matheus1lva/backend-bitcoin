import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

export const Logout = () => {
  const navigate = useNavigate();
  const { updateUser } = useUser();

  useEffect(() => {
    updateUser(null, null);
    navigate("/login");
  }, [navigate, updateUser]);

  return null;
};
