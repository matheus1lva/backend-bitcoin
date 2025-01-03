import { useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasskeyButton } from "@/components/PasskeyButton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { exchangePublicToken, signup } from "../../services/user.service";
import { createPlaidToken } from "../../services/plaid.service";
import { useUser } from "../../contexts/UserContext";
import { apiClient } from "@/lib/client";

const PASSWORD_MIN_LENGTH = 8;

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(255, "Email is too long"),
  password: z
    .string()
    .min(
      PASSWORD_MIN_LENGTH,
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
    )
    .max(100, "Password is too long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

const RegistrationComplete = ({
  userData,
  passKeySet,
  error,
  onPasskeySuccess,
  onPasskeyError,
  onPlaidOpen,
}) => {
  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg space-y-4">
      <h3 className="text-lg font-semibold mb-4">Complete Your Registration</h3>

      <PasskeyButton
        mode="register"
        userId={userData.id}
        username={userData.email}
        onSuccess={onPasskeySuccess}
        onError={onPasskeyError}
        disabled={passKeySet}
      />

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">And</span>
        </div>
      </div>

      <Button onClick={() => onPlaidOpen()} className="w-full">
        Link bank account to plaid
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

const SignUpForm = () => {
  const navigate = useNavigate();
  const { updateUser } = useUser();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    mode: "onChange",
  });

  const [linkToken, setLinkToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [passKeySet, setPassKeySet] = useState(false);

  const { open } = usePlaidLink({
    token: linkToken,
    onSuccess: async public_token => {
      try {
        await exchangePublicToken(userData.id, public_token);
        const response = await apiClient.post("/v1/users/login", {
          email: userData.email,
          password: userData.password,
        });
        const { user, token } = response.data;
        updateUser(user, token);
        navigate("/dashboard");
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to link bank account"
        );
      }
    },
    onExit: () => {
      navigate("/dashboard");
    },
  });

  const onSubmit = async data => {
    try {
      setError(null);
      const response = await signup(data);

      if (!response?.user) {
        throw new Error("Invalid server response");
      }

      updateUser(response.user, response.token);
      setUserData(response.user);
      const responseLink = await createPlaidToken(response.user.id);

      if (!responseLink?.link_token) {
        throw new Error("Failed to create Plaid token");
      }

      setLinkToken(responseLink.link_token);
    } catch (error) {
      setError(
        error.response?.data?.message || "An error occurred during signup"
      );
    }
  };

  if (userData?.id) {
    return (
      <RegistrationComplete
        userData={userData}
        passKeySet={passKeySet}
        error={error}
        onPasskeySuccess={() => setPassKeySet(true)}
        onPasskeyError={setError}
        onPlaidOpen={() => open()}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SignUpForm;
