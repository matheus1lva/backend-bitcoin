import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function usePasskey() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const registerPasskey = async (userId, username) => {
    try {
      setLoading(true);
      setError(null);

      // Get registration options from server
      const optionsRes = await fetch(`${API_URL}/passkey/register/options`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, username }),
        credentials: "include",
      });

      if (!optionsRes.ok) {
        throw new Error("Failed to get registration options");
      }

      const options = await optionsRes.json();

      // Create credentials
      const credential = await startRegistration(options);

      // Verify registration with server
      const verificationRes = await fetch(
        `${API_URL}/passkey/register/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            credential,
          }),
          credentials: "include",
        }
      );

      if (!verificationRes.ok) {
        throw new Error("Failed to verify registration");
      }

      const verification = await verificationRes.json();
      return verification.verified;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to register passkey"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const authenticateWithPasskey = async (username) => {
    try {
      setLoading(true);
      setError(null);

      // Get authentication options from server
      const optionsRes = await fetch(
        `${API_URL}/passkey/authenticate/options`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
          credentials: "include",
        }
      );

      if (!optionsRes.ok) {
        throw new Error("Failed to get authentication options");
      }

      const options = await optionsRes.json();

      // Create credentials
      const credential = await startAuthentication(options);

      // Verify authentication with server
      const verificationRes = await fetch(
        `${API_URL}/passkey/authenticate/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential,
          }),
          credentials: "include",
        }
      );

      if (!verificationRes.ok) {
        throw new Error("Failed to verify authentication");
      }

      const verification = await verificationRes.json();
      return verification.verified;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to authenticate with passkey"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    registerPasskey,
    authenticateWithPasskey,
    error,
    loading,
  };
}
