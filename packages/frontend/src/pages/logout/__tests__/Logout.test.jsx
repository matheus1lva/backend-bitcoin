import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderWithProviders } from "../../../test/test-utils";
import { Logout } from "../Logout";
import * as UserContext from "../../../contexts/UserContext";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    BrowserRouter: ({ children }) => children,
  };
});

describe("Logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should clear user data and navigate to login page", () => {
    const mockUpdateUser = vi.fn();

    vi.spyOn(UserContext, "useUser").mockImplementation(() => ({
      updateUser: mockUpdateUser,
      user: { mockUser: "data" },
    }));

    renderWithProviders(<Logout />);

    expect(mockUpdateUser).toHaveBeenCalledWith(null, null);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
