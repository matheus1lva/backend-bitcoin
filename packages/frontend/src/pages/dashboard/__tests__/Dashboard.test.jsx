import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { Dashboard } from "../Dashboard";

// Mock the custom hooks
vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: vi.fn(),
}));

vi.mock("@/hooks/useAccountBalance", () => ({
  useAccountBalance: vi.fn(),
}));

describe("Dashboard Component", () => {
  describe("when data is loading", () => {
    beforeEach(async () => {
      const { useCurrentUser } = await import("@/hooks/useCurrentUser");
      const { useAccountBalance } = await import("@/hooks/useAccountBalance");

      useCurrentUser.mockReturnValue({ name: "Test User" });
      useAccountBalance.mockReturnValue({ isLoading: true });
    });

    it("displays loading state", () => {
      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe("when there is an error", () => {
    beforeEach(async () => {
      const { useCurrentUser } = await import("@/hooks/useCurrentUser");
      const { useAccountBalance } = await import("@/hooks/useAccountBalance");

      useCurrentUser.mockReturnValue({ name: "Test User" });
      useAccountBalance.mockReturnValue({
        isLoading: false,
        error: new Error("Failed to load balance"),
      });
    });

    it("displays error message", () => {
      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      expect(screen.getByText(/error:/i)).toBeInTheDocument();
      expect(screen.getByText(/failed to load balance/i)).toBeInTheDocument();
    });
  });

  describe("when data is loaded successfully", () => {
    const mockBalanceData = {
      checking: 1000,
      savings: 2000,
      bitcoin: 3000,
    };

    beforeEach(async () => {
      const { useCurrentUser } = await import("@/hooks/useCurrentUser");
      const { useAccountBalance } = await import("@/hooks/useAccountBalance");

      useCurrentUser.mockReturnValue({ name: "Test User" });
      useAccountBalance.mockReturnValue({
        isLoading: false,
        data: mockBalanceData,
      });
    });

    it("displays welcome message with user name", () => {
      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      expect(screen.getByText(/welcome test user/i)).toBeInTheDocument();
    });

    it("displays total balance correctly", () => {
      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      const totalBalance =
        mockBalanceData.checking +
        mockBalanceData.savings +
        mockBalanceData.bitcoin;
      const formattedBalance = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(totalBalance);

      expect(
        screen.getByText(`Total Balance: ${formattedBalance}`)
      ).toBeInTheDocument();
    });

    it("displays buy bitcoin link", () => {
      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      const buyBitcoinLink = screen.getByText(/buy bitcoin/i);
      expect(buyBitcoinLink).toBeInTheDocument();
      expect(buyBitcoinLink.closest("a")).toHaveAttribute(
        "href",
        "/buy-bitcoin"
      );
    });
  });
});
