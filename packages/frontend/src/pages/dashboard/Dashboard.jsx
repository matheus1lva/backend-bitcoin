import { Link } from "../../components/Link";
import { useCurrentUser } from "../../hooks/useCurrentUser";

export function Dashboard() {
  const { name } = useCurrentUser();
  return (
    <div>
      <h1 className="font-bold">Welcome {name}</h1>
      <div>
        <Link to={"/buy-bitcoin"}>Buy Bitcoin</Link>
      </div>
    </div>
  );
}
