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

  purchaseBitcoin: async amount => {
    // // First create a payment
    // const paymentResponse = await apiClient.post("/v1/payment", {
    //   amount,
    // });
    // const { paymentId } = paymentResponse.data;

    // // Poll for payment status (in production, this would be handled by webhooks)
    // let attempts = 0;
    // while (attempts < 10) {
    //   const statusResponse = await apiClient.get(
    //     `/v1/plaid/payment/${paymentId}`
    //   );
    //   if (statusResponse.data.status === "EXECUTED") {
    //     // Once payment is confirmed, initiate the Bitcoin purchase
    const purchaseResponse = await apiClient.post("/v1/bitcoin/purchase", {
      amount,
    });
    return purchaseResponse.data;
  },
  //   if (statusResponse.data.status === "FAILED") {
  //     throw new Error("Payment failed");
  //   }
  //   attempts++;
  //   await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between checks
  // }
  // throw new Error("Payment timed out");
  // },
};
