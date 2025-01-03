import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PasskeyButton } from "../PasskeyButton";

// Create mock functions
const mockRegisterPasskey = vi.fn();
const mockAuthenticateWithPasskey = vi.fn();
const mockUsePasskey = vi.fn();

// Mock the usePasskey hook
vi.mock("@/hooks/usePasskey", () => ({
  usePasskey: () => mockUsePasskey(),
}));

// Setup default mock implementation
beforeEach(() => {
  mockUsePasskey.mockReturnValue({
    registerPasskey: mockRegisterPasskey,
    authenticateWithPasskey: mockAuthenticateWithPasskey,
    loading: false,
    error: null,
  });
});

describe("PasskeyButton Component", () => {
  const user = userEvent.setup();
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementations
    mockRegisterPasskey.mockReset();
    mockAuthenticateWithPasskey.mockReset();
    mockUsePasskey.mockReset();
    // Set default mock implementation
    mockUsePasskey.mockReturnValue({
      registerPasskey: mockRegisterPasskey,
      authenticateWithPasskey: mockAuthenticateWithPasskey,
      loading: false,
      error: null,
    });
    // Mock WebAuthn API
    vi.stubGlobal("PublicKeyCredential", {
      isUserVerifyingPlatformAuthenticatorAvailable: () =>
        Promise.resolve(true),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("Rendering", () => {
    it("renders register button when mode is register", () => {
      render(
        <PasskeyButton
          mode="register"
          userId="123"
          username="test@example.com"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      expect(
        screen.getByRole("button", { name: /continue with passkey/i })
      ).toBeInTheDocument();
    });

    it("renders authenticate button when mode is authenticate", () => {
      render(
        <PasskeyButton
          mode="authenticate"
          username="test@example.com"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      expect(
        screen.getByRole("button", { name: /sign in with passkey/i })
      ).toBeInTheDocument();
    });

    it("renders button as disabled when loading", () => {
      mockUsePasskey.mockReturnValue({
        registerPasskey: mockRegisterPasskey,
        authenticateWithPasskey: mockAuthenticateWithPasskey,
        loading: true,
        error: null,
      });

      render(
        <PasskeyButton
          mode="register"
          userId="123"
          username="test@example.com"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      expect(screen.getByRole("button")).toBeDisabled();
      expect(screen.getByText(/processing/i)).toBeInTheDocument();
    });
  });

  describe("Browser Support", () => {
    it("does not render when PassKeys are not supported", () => {
      vi.stubGlobal("PublicKeyCredential", undefined);

      const { container } = render(
        <PasskeyButton
          mode="register"
          userId="123"
          username="test@example.com"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it("shows error when platform authenticator is not available", async () => {
      vi.stubGlobal("PublicKeyCredential", {
        isUserVerifyingPlatformAuthenticatorAvailable: () =>
          Promise.resolve(false),
      });

      render(
        <PasskeyButton
          mode="register"
          userId="123"
          username="test@example.com"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockOnError).toHaveBeenCalledWith(
        "No platform authenticator available (Face ID, Touch ID, Windows Hello, etc)"
      );
    });
  });

  describe("Registration Flow", () => {
    it("calls registerPasskey with correct parameters", async () => {
      mockRegisterPasskey.mockResolvedValue(true);

      render(
        <PasskeyButton
          mode="register"
          userId="123"
          username="test@example.com"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockRegisterPasskey).toHaveBeenCalledWith(
        "123",
        "test@example.com"
      );
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it("handles registration failure", async () => {
      mockUsePasskey.mockReturnValue({
        registerPasskey: mockRegisterPasskey,
        authenticateWithPasskey: mockAuthenticateWithPasskey,
        loading: false,
        error: "Registration failed",
      });

      render(
        <PasskeyButton
          mode="register"
          userId="123"
          username="test@example.com"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockOnError).toHaveBeenCalledWith("Registration failed");
    });
  });

  describe("Authentication Flow", () => {
    it("calls authenticateWithPasskey with correct parameters", async () => {
      mockAuthenticateWithPasskey.mockResolvedValue(true);

      render(
        <PasskeyButton
          mode="authenticate"
          username="test@example.com"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockAuthenticateWithPasskey).toHaveBeenCalledWith(
        "test@example.com"
      );
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it("handles authentication failure", async () => {
      mockUsePasskey.mockReturnValue({
        registerPasskey: mockRegisterPasskey,
        authenticateWithPasskey: mockAuthenticateWithPasskey,
        loading: false,
        error: "Authentication failed",
      });

      render(
        <PasskeyButton
          mode="authenticate"
          username="test@example.com"
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockOnError).toHaveBeenCalledWith("Authentication failed");
    });
  });
});
