import { apiClient } from "../lib/client";

export async function getRegistrationOptions(userId, username) {
  const response = await apiClient.post("/v1/passkey/register/options", {
    userId,
    username,
  });
  return response.data;
}

export async function verifyRegistration(userId, credential) {
  const response = await apiClient.post("/v1/passkey/register/verify", {
    userId,
    credential,
  });
  return response.data;
}

export async function getAuthenticationOptions(username) {
  const response = await apiClient.post("/v1/passkey/authenticate/options", {
    username,
  });
  return response.data;
}

export async function verifyAuthentication(credential) {
  const response = await apiClient.post("/v1/passkey/authenticate/verify", {
    credential,
  });
  return response.data;
}
