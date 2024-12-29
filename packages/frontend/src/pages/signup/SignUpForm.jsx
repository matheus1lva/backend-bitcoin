import React, { useState } from "react";
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
import { exchangePublicToken, signup } from "../../services/user.service";
import { createPlaidToken } from "../../services/plaid.service";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
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
  });
  const [linkToken, setLinkToken] = useState(null);
  const [userData, setUserData] = useState(null);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async public_token => {
      try {
        await exchangePublicToken(userData.id, public_token);
      } catch (error) {
        console.error("Error completing signup:", error);
      }
    },
    onExit: () => {
      navigate("/dashboard");
    },
  });

  const onSubmit = async data => {
    try {
      const response = await signup(data);

      if (response.data) {
        const responseLink = await createPlaidToken(response.data.id);
        setLinkToken(responseLink.data.link_token);
        setUserData(response.data);
      }
    } catch (error) {
      console.error("Error during signup:", error);
    }
  };

  if (userData?.id) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <Button onClick={() => open()}>Link bank account to plaid</Button>
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
