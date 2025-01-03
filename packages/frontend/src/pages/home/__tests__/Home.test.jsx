import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { Home } from "../Home";

// Mock useCurrentUser hook
vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: vi.fn(),
}));

// Mock react-router-dom's Navigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Navigate: ({ to }) => <div data-testid="mock-navigate" data-to={to} />,
  };
});

describe("Home Component", () => {
  describe("when user is not logged in", () => {
    beforeEach(async () => {
      const { useCurrentUser } = await import("@/hooks/useCurrentUser");
      useCurrentUser.mockReturnValue({});
    });

    it("renders welcome message and signup link", () => {
      render(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );

      expect(screen.getByText(/crypto wallet/i)).toBeInTheDocument();
      expect(
        screen.getByText(/if you are not registered/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/sign up/i)).toBeInTheDocument();
      expect(screen.getByText(/sign up/i).closest("a")).toHaveAttribute(
        "href",
        "/signup"
      );
    });
  });

  describe("when user is logged in", () => {
    beforeEach(async () => {
      const { useCurrentUser } = await import("@/hooks/useCurrentUser");
      useCurrentUser.mockReturnValue({ id: "1", name: "Test User" });
    });

    it("redirects to dashboard", () => {
      render(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );

      const navigation = screen.getByTestId("mock-navigate");
      expect(navigation).toHaveAttribute("data-to", "/dashboard");
    });
  });
});
