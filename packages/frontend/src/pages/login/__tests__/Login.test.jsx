import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Login } from "../Login";
import { apiClient } from "@/lib/client";
import { UserProvider } from "@/contexts/UserContext";

// Mock the PasskeyButton component
vi.mock("@/components/PasskeyButton", () => ({
  PasskeyButton: ({ onSuccess }) => (
    <button onClick={() => onSuccess()} data-testid="mock-passkey-button">
      Continue with passkey
    </button>
  ),
}));

// Mock the API client
vi.mock("@/lib/client");

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <Login />
        </UserProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe("Login Component", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.clear();
    queryClient.clear();
    mockNavigate.mockClear();
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders all form elements correctly", () => {
      renderLoginPage();

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i })
      ).toBeInTheDocument();
      expect(screen.getByTestId("mock-passkey-button")).toBeInTheDocument();
      expect(screen.getByText(/or continue with email/i)).toBeInTheDocument();
    });

    it("renders input placeholders correctly", () => {
      renderLoginPage();

      expect(
        screen.getByPlaceholderText(/enter your email/i)
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/enter your password/i)
      ).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    it("shows validation errors when submitting empty form", async () => {
      renderLoginPage();

      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(
          screen.getByText(/password must be at least 6 characters/i)
        ).toBeInTheDocument();
      });
    });

    it("shows validation error for invalid email format", async () => {
      renderLoginPage();

      // Fill in the form with invalid email
      await user.type(screen.getByLabelText(/email/i), "invalid-email");
      await user.type(screen.getByLabelText(/password/i), "password123");

      // Submit the form
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      // Wait for validation state to update and error message to appear
      await waitFor(
        () => {
          const errors = screen.getAllByText(/invalid email address/i);
          expect(errors.length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );
    });

    it("shows validation error for short password", async () => {
      renderLoginPage();

      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/password/i), "12345");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/password must be at least 6 characters/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Authentication Flow", () => {
    it("handles successful login and redirects to dashboard", async () => {
      const mockResponse = {
        data: {
          token: "fake-jwt-token",
          user: {
            id: "1",
            email: "test@example.com",
            name: "Test User",
          },
        },
      };

      apiClient.post.mockResolvedValueOnce(mockResponse);
      renderLoginPage();

      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith("/v1/users/login", {
          email: "test@example.com",
          password: "password123",
        });
        expect(localStorage.getItem("token")).toBe("fake-jwt-token");
        expect(JSON.parse(localStorage.getItem("user"))).toEqual(
          mockResponse.data.user
        );
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("handles login failure and shows error message", async () => {
      const errorResponse = {
        response: {
          data: {
            message: "Invalid credentials",
          },
        },
      };

      apiClient.post.mockRejectedValueOnce(errorResponse);
      renderLoginPage();

      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/password/i), "wrongpassword");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          /invalid credentials/i
        );
        expect(localStorage.getItem("token")).toBeNull();
        expect(localStorage.getItem("user")).toBeNull();
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it("handles generic error when API fails without error message", async () => {
      apiClient.post.mockRejectedValueOnce(new Error());
      renderLoginPage();

      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(/failed to login/i);
      });
    });
  });

  describe("Passkey Authentication", () => {
    it("handles passkey authentication success and redirects to dashboard", async () => {
      renderLoginPage();

      await user.click(screen.getByTestId("mock-passkey-button"));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      });
    });
  });
});
