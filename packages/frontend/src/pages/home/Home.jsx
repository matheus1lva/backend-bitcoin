import { Link } from "react-router-dom";

export function Home() {
  return (
    <div>
      <h1>Crypto Wallet</h1>
      <p>
        if you are not registered please <Link to="/signup">sign up</Link>
      </p>
    </div>
  );
}
