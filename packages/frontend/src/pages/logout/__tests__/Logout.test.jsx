import { render, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Logout } from "../Logout";
import { apiClient } from "@/lib/client";

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the API client
vi.mock("@/lib/client", () => ({
  apiClient: {
    defaults: {
      headers: {
        common: {},
      },
    },
  },
}));

describe("Logout Component", () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
    vi.clearAllMocks();

    // Setup initial state
    localStorage.setItem("token", "fake-token");
    localStorage.setItem("user", JSON.stringify({ id: 1, name: "Test User" }));
    apiClient.defaults.headers.common["Authorization"] = "Bearer fake-token";
  });

  it("clears authentication data and redirects to login", async () => {
    const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");

    render(<Logout />);

    await waitFor(() => {
      // Check if localStorage items were removed
      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();

      // Check if Authorization header was removed
      expect(
        apiClient.defaults.headers.common["Authorization"]
      ).toBeUndefined();

      // Check if storage event was dispatched
      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
      expect(dispatchEventSpy.mock.calls[0][0].type).toBe("storage");

      // Check if navigation occurred
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("renders nothing", () => {
    const { container } = render(<Logout />);
    expect(container.firstChild).toBeNull();
  });
});
