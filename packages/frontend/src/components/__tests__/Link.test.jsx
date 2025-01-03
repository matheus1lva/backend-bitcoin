import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { Link } from "../Link";

describe("Link Component", () => {
  it("renders link with correct href", () => {
    render(
      <BrowserRouter>
        <Link to="/test">Test Link</Link>
      </BrowserRouter>
    );

    const link = screen.getByText(/test link/i);
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });

  it("renders children correctly", () => {
    render(
      <BrowserRouter>
        <Link to="/test">
          <span>Child Element</span>
        </Link>
      </BrowserRouter>
    );

    expect(screen.getByText(/child element/i)).toBeInTheDocument();
  });

  it("has correct styling classes", () => {
    render(
      <BrowserRouter>
        <Link to="/test">Test Link</Link>
      </BrowserRouter>
    );

    const link = screen.getByText(/test link/i);
    expect(link).toHaveClass(
      "font-semibold",
      "text-primary-button",
      "hover:text-primary-button-hover",
      "underline"
    );
  });
});
