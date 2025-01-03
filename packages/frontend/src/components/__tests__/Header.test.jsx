import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Header } from "../Header";
import { renderWithProviders } from "@/test/test-utils";

describe("Header Component", () => {
  describe("when user is not logged in", () => {
    it("renders login and signup links", () => {
      renderWithProviders(<Header />);

      expect(screen.getByText(/sign up/i)).toBeInTheDocument();
      expect(screen.getByText(/login/i)).toBeInTheDocument();
      expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/logout/i)).not.toBeInTheDocument();
    });

    it("has correct navigation links", () => {
      renderWithProviders(<Header />);

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
    const mockUser = { id: "1", name: "Test User" };

    it("renders dashboard and logout links", () => {
      renderWithProviders(<Header />, { initialUser: mockUser });

      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/logout/i)).toBeInTheDocument();
      expect(screen.queryByText(/sign up/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/login/i)).not.toBeInTheDocument();
    });

    it("has correct navigation links", () => {
      renderWithProviders(<Header />, { initialUser: mockUser });

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
