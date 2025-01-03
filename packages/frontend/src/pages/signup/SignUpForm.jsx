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

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const SignUpForm = () => {
  const navigate = useNavigate();
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

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async public_token => {
      try {
        await exchangePublicToken(userData.id, public_token);
        navigate("/dashboard");
      } catch (error) {
        console.error("Error completing signup:", error);
        setError("Failed to link bank account");
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

      if (response.user) {
        setUserData(response.user);
        const responseLink = await createPlaidToken(response.user.id);
        setLinkToken(responseLink.link_token);
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setError(error.response?.data?.message || "Error during signup");
    }
  };

  const handlePasskeySuccess = () => {
    setPassKeySet(true);
  };

  const handlePasskeyError = errorMessage => {
    setError(errorMessage);
  };

  if (userData?.id) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg space-y-4">
        <h3 className="text-lg font-semibold mb-4">
          Complete Your Registration
        </h3>

        <PasskeyButton
          mode="register"
          userId={userData.id}
          username={userData.email}
          onSuccess={handlePasskeySuccess}
          onError={handlePasskeyError}
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

        <Button onClick={() => open()} className="w-full">
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

          <Button
            type="submit"
            className="w-full"
            disabled={!ready && linkToken !== null}
          >
            Sign Up
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SignUpForm;
