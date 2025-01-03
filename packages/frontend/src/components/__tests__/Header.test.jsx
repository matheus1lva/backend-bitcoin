import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { Header } from "../Header";

// Mock useCurrentUser hook
vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: vi.fn(),
}));

describe("Header Component", () => {
  describe("when user is not logged in", () => {
    beforeEach(async () => {
      const { useCurrentUser } = await import("@/hooks/useCurrentUser");
      useCurrentUser.mockReturnValue({});
    });

    it("renders login and signup links", () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      expect(screen.getByText(/sign up/i)).toBeInTheDocument();
      expect(screen.getByText(/login/i)).toBeInTheDocument();
      expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/logout/i)).not.toBeInTheDocument();
    });

    it("has correct navigation links", () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      expect(screen.getByText(/home/i).closest("a")).toHaveAttribute(
        "href",
        "/"
      );
      expect(screen.getByText(/sign up/i).closest("a")).toHaveAttribute(
        "href",
        "/signup"
      );
      expect(screen.getByText(/login/i).closest("a")).toHaveAttribute(
        "href",
        "/login"
      );
    });
  });

  describe("when user is logged in", () => {
    beforeEach(async () => {
      const { useCurrentUser } = await import("@/hooks/useCurrentUser");
      useCurrentUser.mockReturnValue({ id: "1", name: "Test User" });
    });

    it("renders dashboard and logout links", () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/logout/i)).toBeInTheDocument();
      expect(screen.queryByText(/sign up/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/login/i)).not.toBeInTheDocument();
    });

    it("has correct navigation links", () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      expect(screen.getByText(/home/i).closest("a")).toHaveAttribute(
        "href",
        "/"
      );
      expect(screen.getByText(/dashboard/i).closest("a")).toHaveAttribute(
        "href",
        "/dashboard"
      );
      expect(screen.getByText(/logout/i).closest("a")).toHaveAttribute(
        "href",
        "/logout"
      );
    });
  });
});
