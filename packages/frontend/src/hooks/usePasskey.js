import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import { useState } from "react";
import {
  getRegistrationOptions,
  verifyRegistration,
  getAuthenticationOptions,
  verifyAuthentication,
} from "../services/passkey.service";

export function usePasskey() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const registerPasskey = async (userId, username) => {
    try {
      setLoading(true);
      setError(null);

      // Get registration options from server
      const options = await getRegistrationOptions(userId, username);
      console.log(options);

      // Create credentials
      const credential = await startRegistration({
        optionsJSON: options,
        useAutoRegister: false,
      });

      // Verify registration with server
      const verification = await verifyRegistration(userId, credential);
      return verification.verified;
    } catch (err) {
      console.log({
        err,
      });
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to register passkey"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const authenticateWithPasskey = async username => {
    try {
      setLoading(true);
      setError(null);

      // Get authentication options from server
      const options = await getAuthenticationOptions(username);

      // Create credentials
      const credential = await startAuthentication({
        optionsJSON: options,
      });

      // Verify authentication with server
      const verification = await verifyAuthentication(credential);

      if (verification.verified) {
        localStorage.setItem("token", verification.token);
        localStorage.setItem("user", JSON.stringify(verification.user));
      }

      return verification.verified;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to authenticate with passkey"
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
