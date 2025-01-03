import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "../contexts/UserContext";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function renderWithProviders(
  ui,
  { initialUser = null, ...renderOptions } = {}
) {
  // Create a new QueryClient for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  // Mock localStorage for tests
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  };
  Object.defineProperty(window, "localStorage", { value: localStorageMock });

  if (initialUser) {
    localStorageMock.getItem.mockImplementation(key => {
      if (key === "user") return JSON.stringify(initialUser);
      if (key === "token") return "test-token";
      return null;
    });
  }

  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <UserProvider>{children}</UserProvider>
        </QueryClientProvider>
      </BrowserRouter>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    localStorageMock,
  };
}
