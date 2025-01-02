import { apiClient } from "../lib/client";

export const bitcoinService = {
  getAddress: async () => {
    const response = await apiClient.get("/v1/bitcoin/address");
    return response.data;
  },

  getBalance: async () => {
    const response = await apiClient.get("/v1/bitcoin/balance");
    return response.data;
  },

  getBankBalance: async () => {
    const response = await apiClient.get("/v1/plaid/balance");
    return response.data;
  },

  getCurrentPrice: async () => {
    const response = await apiClient.get("/v1/bitcoin/price");
    return response.data;
  },

  purchaseBitcoin: async amountUsd => {
    const purchaseResponse = await apiClient.post("/v1/bitcoin/purchase", {
      amount: amountUsd,
    });
    return purchaseResponse.data;
  },
};
