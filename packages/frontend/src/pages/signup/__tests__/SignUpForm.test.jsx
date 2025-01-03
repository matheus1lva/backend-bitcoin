import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import SignUpForm from "../SignUpForm";
import { signup } from "@/services/user.service";
import { createPlaidToken } from "@/services/plaid.service";

// Mock the services
vi.mock("@/services/user.service", () => ({
  signup: vi.fn(),
  exchangePublicToken: vi.fn(),
}));

vi.mock("@/services/plaid.service", () => ({
  createPlaidToken: vi.fn(),
}));

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the PasskeyButton component
vi.mock("@/components/PasskeyButton", () => ({
  PasskeyButton: ({ onSuccess, onError, disabled }) => (
    <button
      onClick={() => onSuccess()}
      onContextMenu={e => {
        e.preventDefault();
        onError("Passkey error");
      }}
      data-testid="mock-passkey-button"
      disabled={disabled}
    >
      Set up passkey
    </button>
  ),
}));

// Mock the Plaid Link component
vi.mock("react-plaid-link", () => ({
  usePlaidLink: () => ({
    open: vi.fn(),
    ready: true,
  }),
}));

describe("SignUpForm Component", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial Form", () => {
    it("renders all form elements correctly", () => {
      render(
        <BrowserRouter>
          <SignUpForm />
        </BrowserRouter>
      );

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign up/i })
      ).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    it("shows validation errors when submitting empty form", async () => {
      render(
        <BrowserRouter>
          <SignUpForm />
        </BrowserRouter>
      );

      await user.click(screen.getByRole("button", { name: /sign up/i }));

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(
          screen.getByText(/password must be at least 8 characters/i)
        ).toBeInTheDocument();
      });
    });

    it("shows validation error for invalid email format", async () => {
      render(
        <BrowserRouter>
          <SignUpForm />
        </BrowserRouter>
      );

      await user.type(screen.getByLabelText(/name/i), "Test User");
      await user.type(screen.getByLabelText(/email/i), "invalid-email");
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /sign up/i }));

      await waitFor(() => {
        const emailFormItem = screen
          .getByLabelText(/email/i)
          .closest(".space-y-2");
        expect(emailFormItem).toHaveTextContent(/invalid email address/i);
      });
    });

    it("shows validation error for short password", async () => {
      render(
        <BrowserRouter>
          <SignUpForm />
        </BrowserRouter>
      );

      await user.type(screen.getByLabelText(/name/i), "Test User");
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/password/i), "123");
      await user.click(screen.getByRole("button", { name: /sign up/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/password must be at least 8 characters/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Signup Flow", () => {
    const validFormData = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    };

    it("handles successful signup flow", async () => {
      const mockUser = { id: "123", email: validFormData.email };
      const mockLinkToken = "test-link-token";

      signup.mockResolvedValueOnce({ user: mockUser });
      createPlaidToken.mockResolvedValueOnce({ link_token: mockLinkToken });

      render(
        <BrowserRouter>
          <SignUpForm />
        </BrowserRouter>
      );

      await user.type(screen.getByLabelText(/name/i), validFormData.name);
      await user.type(screen.getByLabelText(/email/i), validFormData.email);
      await user.type(
        screen.getByLabelText(/password/i),
        validFormData.password
      );
      await user.click(screen.getByRole("button", { name: /sign up/i }));

      await waitFor(() => {
        expect(signup).toHaveBeenCalledWith(validFormData);
        expect(createPlaidToken).toHaveBeenCalledWith(mockUser.id);
        expect(
          screen.getByText(/complete your registration/i)
        ).toBeInTheDocument();
        expect(screen.getByTestId("mock-passkey-button")).toBeInTheDocument();
        expect(
          screen.getByText(/link bank account to plaid/i)
        ).toBeInTheDocument();
      });
    });

    it("handles passkey registration success", async () => {
      const mockUser = { id: "123", email: validFormData.email };
      signup.mockResolvedValueOnce({ user: mockUser });
      createPlaidToken.mockResolvedValueOnce({ link_token: "test-link-token" });

      render(
        <BrowserRouter>
          <SignUpForm />
        </BrowserRouter>
      );

      // Complete initial signup
      await user.type(screen.getByLabelText(/name/i), validFormData.name);
      await user.type(screen.getByLabelText(/email/i), validFormData.email);
      await user.type(
        screen.getByLabelText(/password/i),
        validFormData.password
      );
      await user.click(screen.getByRole("button", { name: /sign up/i }));

      // Click passkey button
      await waitFor(() => {
        expect(screen.getByTestId("mock-passkey-button")).toBeInTheDocument();
      });
      await user.click(screen.getByTestId("mock-passkey-button"));

      await waitFor(() => {
        const passKeyButton = screen.getByTestId("mock-passkey-button");
        expect(passKeyButton).toBeDisabled();
      });
    });
  });
});
