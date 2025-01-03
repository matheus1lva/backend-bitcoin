import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BuyBitcoin } from "../BuyBitcoin";
import { bitcoinService } from "@/services/bitcoin.service";
import { Toaster } from "@/components/ui/toaster";

// Mock the custom hooks and services
vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: vi.fn(),
}));

vi.mock("@/services/bitcoin.service", () => ({
  bitcoinService: {
    getBalance: vi.fn(),
    getBankBalance: vi.fn(),
    getCurrentPrice: vi.fn(),
    purchaseBitcoin: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderBuyBitcoin = () => {
  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <BuyBitcoin />
        <Toaster />
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe("BuyBitcoin Component", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  describe("Initial Rendering", () => {
    beforeEach(async () => {
      const { useCurrentUser } = await import("@/hooks/useCurrentUser");
      useCurrentUser.mockReturnValue({
        btcReceiveAddress: "test-btc-address",
        hasLinkedBank: true,
      });

      bitcoinService.getBalance.mockResolvedValue({ balance: "1.23456789" });
      bitcoinService.getBankBalance.mockResolvedValue({ available: 5000 });
      bitcoinService.getCurrentPrice.mockResolvedValue({ price: 45000 });
    });

    it("displays bitcoin address and balances", async () => {
      renderBuyBitcoin();

      await waitFor(() => {
        expect(screen.getByText(/test-btc-address/)).toBeTruthy();
        expect(screen.getByText(/1.23456789 BTC/)).toBeTruthy();
        expect(screen.getByText(/\$45,000/)).toBeTruthy();
      });
    });

    it("calculates estimated BTC correctly when entering USD amount", async () => {
      renderBuyBitcoin();

      const amountInput = await screen.findByLabelText(/amount/i);
      await user.type(amountInput, "45000");

      await waitFor(() => {
        expect(screen.getByText(/≈ 1.00000000 BTC/)).toBeInTheDocument();
      });
    });
  });

  describe("Form Validation", () => {
    beforeEach(async () => {
      const { useCurrentUser } = await import("@/hooks/useCurrentUser");
      useCurrentUser.mockReturnValue({
        btcReceiveAddress: "test-btc-address",
        hasLinkedBank: true,
      });

      bitcoinService.getBankBalance.mockResolvedValue({ available: 5000 });
      bitcoinService.getCurrentPrice.mockResolvedValue({ price: 45000 });
    });

    it("shows validation error for empty amount", async () => {
      renderBuyBitcoin();

      const submitButton = screen.getByRole("button", {
        name: /purchase bitcoin/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/amount is required/i)).toBeInTheDocument();
      });
    });

    it("shows validation error for invalid amount", async () => {
      renderBuyBitcoin();

      const amountInput = await screen.findByLabelText(/amount/i);
      await user.type(amountInput, "-100");

      const submitButton = screen.getByRole("button", {
        name: /purchase bitcoin/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/amount must be a positive number/i)
        ).toBeInTheDocument();
      });
    });

    it("shows error when trying to purchase more than available bank balance", async () => {
      renderBuyBitcoin();

      const amountInput = await screen.findByLabelText(/amount/i);
      await user.type(amountInput, "6000"); // More than available balance of 5000

      const submitButton = screen.getByRole("button", {
        name: /purchase bitcoin/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/you don't have enough funds/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Purchase Flow", () => {
    beforeEach(async () => {
      const { useCurrentUser } = await import("@/hooks/useCurrentUser");
      useCurrentUser.mockReturnValue({
        btcReceiveAddress: "test-btc-address",
        hasLinkedBank: true,
      });

      bitcoinService.getBankBalance.mockResolvedValue({ available: 5000 });
      bitcoinService.getCurrentPrice.mockResolvedValue({ price: 45000 });
    });

    it("handles successful purchase", async () => {
      bitcoinService.purchaseBitcoin.mockResolvedValue({
        amountBtc: 0.1,
        amountUsd: 4500,
        txid: "test-transaction-id",
      });

      renderBuyBitcoin();

      const amountInput = await screen.findByLabelText(/amount/i);
      await user.type(amountInput, "4500");

      const submitButton = screen.getByRole("button", {
        name: /purchase bitcoin/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/purchase successful/i)).toBeInTheDocument();
        expect(screen.getByText(/test-transaction-id/)).toBeInTheDocument();
        expect(bitcoinService.purchaseBitcoin).toHaveBeenCalledWith(4500);
      });
    });

    it("handles purchase failure", async () => {
      bitcoinService.purchaseBitcoin.mockRejectedValue(
        new Error("Purchase failed")
      );

      renderBuyBitcoin();

      const amountInput = await screen.findByLabelText(/amount/i);
      await user.type(amountInput, "1000");

      const submitButton = screen.getByRole("button", {
        name: /purchase bitcoin/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/purchase failed/i)).toBeInTheDocument();
      });
    });

    it("disables submit button during purchase", async () => {
      bitcoinService.purchaseBitcoin.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      renderBuyBitcoin();

      const amountInput = await screen.findByLabelText(/amount/i);
      await user.type(amountInput, "1000");

      const submitButton = screen.getByRole("button", {
        name: /purchase bitcoin/i,
      });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/processing/i)).toBeInTheDocument();
    });
  });
});
