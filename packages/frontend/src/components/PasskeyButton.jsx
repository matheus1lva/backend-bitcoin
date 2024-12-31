import { Button } from "./ui/button";
import { usePasskey } from "../hooks/usePasskey";
import { useState } from "react";

export function PasskeyButton({
  mode,
  userId,
  username,
  onSuccess,
  onError,
  disabled,
}) {
  const {
    registerPasskey,
    authenticateWithPasskey,
    loading,
    error: passkeyError,
  } = usePasskey();
  const [isSupported] = useState(() => {
    return (
      window.PublicKeyCredential !== undefined &&
      typeof window.PublicKeyCredential
        .isUserVerifyingPlatformAuthenticatorAvailable === "function"
    );
  });

  const handleClick = async () => {
    try {
      if (!isSupported) {
        throw new Error("Passkeys are not supported in this browser");
      }

      // Check if platform authenticator is available
      const isPlatformAuthenticatorAvailable =
        await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!isPlatformAuthenticatorAvailable) {
        throw new Error(
          "No platform authenticator available (Face ID, Touch ID, Windows Hello, etc)"
        );
      }

      let success = false;
      if (mode === "register" && userId) {
        success = await registerPasskey(userId, username);
      } else if (mode === "authenticate") {
        success = await authenticateWithPasskey(username);
      }

      if (success) {
        onSuccess?.();
      } else if (passkeyError) {
        onError?.(passkeyError);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "An error occurred";
      onError?.(errorMessage);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading || disabled}
      variant="outline"
      className="w-full"
    >
      {loading
        ? "Processing..."
        : mode === "register"
          ? "Continue with passkey"
          : "Sign in with passkey"}
    </Button>
  );
}
