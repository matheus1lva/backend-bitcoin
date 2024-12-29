import { apiClient } from "../lib/client";

export async function createPlaidToken(userId) {
  const response = await apiClient.post("/v1/user/create-plaid-token", {
    userId,
  });
  return response.data;
}
