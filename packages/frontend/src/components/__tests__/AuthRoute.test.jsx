import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthRoute } from "../AuthRoute";

// Mock react-router-dom's Navigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Navigate: ({ to }) => <div data-testid="mock-navigate" data-to={to} />,
  };
});

describe("AuthRoute Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("when user is not authenticated", () => {
    it("redirects to login page", () => {
      render(
        <BrowserRouter>
          <AuthRoute />
        </BrowserRouter>
      );

      const navigation = screen.getByTestId("mock-navigate");
      expect(navigation).toHaveAttribute("data-to", "/login");
    });
  });

  describe("when user is authenticated", () => {
    beforeEach(() => {
      localStorage.setItem("token", "fake-token");
    });

    it("renders the outlet", () => {
      const { container } = render(
        <BrowserRouter>
          <AuthRoute />
        </BrowserRouter>
      );

      expect(screen.queryByTestId("mock-navigate")).not.toBeInTheDocument();
      expect(container.firstChild).toBeNull(); // Outlet is mocked and renders nothing
    });
  });
});
