import { getPlaidBalance } from "../services/plaid.service";
import { useQuery } from "@tanstack/react-query";
export function useAccountBalance() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["account-balance"],
    queryFn: getPlaidBalance,
  });
  return { data, isLoading, error };
}
