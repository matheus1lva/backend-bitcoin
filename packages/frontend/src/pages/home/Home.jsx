import { Link, Navigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

export function Home() {
  const { user } = useUser();

  if (user?.id) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div>
      <h1>Crypto Wallet</h1>
      <p>
        if you are not registered please <Link to="/signup">sign up</Link>
      </p>
    </div>
  );
}
