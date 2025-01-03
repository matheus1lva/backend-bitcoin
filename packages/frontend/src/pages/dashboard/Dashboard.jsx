import { Link } from "../../components/Link";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useAccountBalance } from "../../hooks/useAccountBalance";

export function Dashboard() {
  const user = useCurrentUser();
  const { data, isLoading, error } = useAccountBalance();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const totalBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Object.values(data).reduce((acc, curr) => acc + curr, 0));

  return (
    <div className="flex flex-col gap-2 items-start">
      <h1 className="font-bold">Welcome {user?.name}</h1>
      <div className="flex flex-col gap-2 items-start">
        <div>Total Balance: {totalBalance}</div>
      </div>
      <div>
        <Link to={"/buy-bitcoin"}>Buy Bitcoin</Link>
      </div>
    </div>
  );
}
