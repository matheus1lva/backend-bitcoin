import { screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Home } from "../Home";
import { renderWithProviders } from "@/test/test-utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock react-router-dom's useNavigate and Navigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Navigate: () => (
      <div data-testid="mock-navigate">Redirecting to dashboard</div>
    ),
  };
});

// Mock the Dashboard component
vi.mock("@/pages/dashboard/Dashboard", () => ({
  Dashboard: () => <div data-testid="mock-dashboard">dashboard</div>,
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

describe("Home Component", () => {
  it("redirects to dashboard when user is logged in", () => {
    renderWithProviders(
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>,
      {
        initialUser: { id: "1", name: "Test User" },
      }
    );

    expect(screen.getByTestId("mock-navigate")).toBeInTheDocument();
  });

  it("renders welcome message and signup link when user is not logged in", () => {
    renderWithProviders(
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>
    );

    expect(screen.getByText(/crypto wallet/i)).toBeInTheDocument();
    expect(screen.getByText(/if you are not registered/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute(
      "href",
      "/signup"
    );
  });
});
