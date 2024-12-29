import { Button } from "./ui/button";
import { usePasskey } from "../hooks/usePasskey";
import { useState } from "react";

export function PasskeyButton({ mode, userId, username, onSuccess, onError }) {
  const { registerPasskey, authenticateWithPasskey, loading } = usePasskey();
  const [isSupported] = useState(() => {
    return window.PublicKeyCredential !== undefined;
  });

  const handleClick = async () => {
    try {
      if (!isSupported) {
        throw new Error("Passkeys are not supported in this browser");
      }

      let success = false;
      if (mode === "register" && userId) {
        success = await registerPasskey(userId, username);
      } else if (mode === "authenticate") {
        success = await authenticateWithPasskey(username);
      }

      if (success) {
        onSuccess?.();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      onError?.(errorMessage);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant="outline"
      className="w-full"
    >
      {loading ? (
        <span className="animate-pulse">Processing...</span>
      ) : mode === "register" ? (
        "Register Passkey"
      ) : (
        "Sign in with Passkey"
      )}
    </Button>
  );
}
