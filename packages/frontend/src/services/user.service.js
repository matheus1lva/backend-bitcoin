import { apiClient } from "../lib/client";

export function exchangePublicToken(userId, publicToken) {
  return apiClient.post("/v1/users/exchange-public-token", {
    userId,
    public_token: publicToken,
  });
}

export async function signup(data) {
  const response = await apiClient.post("/v1/users/signup", data);
  localStorage.setItem("token", response.data.token);
  localStorage.setItem("user", JSON.stringify(response.data.user));
  return response.data;
}
