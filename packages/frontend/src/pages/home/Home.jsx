import { Link, Navigate } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";

export function Home() {
  const user = useCurrentUser();

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
