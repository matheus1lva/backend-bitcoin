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
import { useUser } from "../contexts/UserContext";

export function usePasskey() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { updateUser } = useUser();

  const registerPasskey = async (userId, username) => {
    try {
      setLoading(true);
      setError(null);

      const options = await getRegistrationOptions(userId, username);

      const credential = await startRegistration({
        optionsJSON: options,
        useAutoRegister: false,
      });

      const verification = await verifyRegistration(userId, credential);
      return verification.verified;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to register passkey"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const authenticateWithPasskey = async username => {
    try {
      setLoading(true);
      setError(null);

      const options = await getAuthenticationOptions(username);
      const credential = await startAuthentication({
        optionsJSON: options,
      });

      const verification = await verifyAuthentication(credential);

      if (!verification?.verified) {
        throw new Error("Authentication failed");
      }

      if (!verification.token || !verification.user) {
        throw new Error("Invalid server response");
      }

      updateUser(verification.user, verification.token);
      return true;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to authenticate with passkey"
      );
      throw err;
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
