import "@testing-library/jest-dom/vitest";
import { TextEncoder, TextDecoder } from "util";

// Add TextEncoder and TextDecoder to global scope
Object.assign(global, {
  TextEncoder,
  TextDecoder,
});

// Mock matchMedia if it's not available in jsdom
if (!window.matchMedia) {
  window.matchMedia = query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  });
}
