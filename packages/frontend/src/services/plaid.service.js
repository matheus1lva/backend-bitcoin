import { apiClient } from "../lib/client";

export async function createPlaidToken(userId) {
  const response = await apiClient.post("/v1/users/create-plaid-token", {
    userId,
  });
  return response.data;
}

export async function getPlaidBalance() {
  const response = await apiClient.get(`/v1/payment/balance`);
  return response.data;
}
