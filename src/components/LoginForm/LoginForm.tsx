// LoginForm.tsx

import { useForm } from "@tanstack/react-form";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import { Input } from "../ui/input";
import { getRole } from "../../utils/auth";
import z from "zod";

import { useState } from "react";
import { useAuthLogin } from "../../hooks/useAuth";
import { setAccessToken } from "../../utils/TokenStorage";
import { useNavigate } from "react-router-dom";

const loginSchema = z.object({
  email: z.string().min(1, "email is required"),
  password: z.string().min(1, "password is required"),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const { mutate: loginMutate } = useAuthLogin();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },

    validators: {
      onSubmit: loginSchema,
    },

    onSubmit: async ({ value }) => {
      console.log("Login Value:", value);
      setIsLoading(true);
      loginMutate(
        { request: value },

        {
          onSuccess: (res) => {
            console.log("FULL RESPONSE:", res);
            const token = res?.data;

            console.log("TOKEN:", token);

            if (token) {
              setAccessToken(token);
              console.log(
                "Saved Token:",
                localStorage.getItem("accessToken")
              );
              const role = getRole();
              console.log("ROLE:", role); 
              if (role === "admin") {
                navigate("/admin/dashboard");
              } else {
                navigate("/admin/pos");
              }
            } else {
              setError("Token not found");
            }
          },
          onError: (error) => {
            console.log("Login failed", error);
            setError("Invalid email or password");
          },
          onSettled: () => {
            setIsLoading(false);
          },
        }
      );
    },
  });

  return (
    <div
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <Card className="overflow-hidden p-0">

        <CardContent className="grid p-0 md:grid-cols-2">

          <form
            className="p-6 md:p-8"
            id="login-form"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >

            <FieldGroup>

              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">
                  Welcome back
                </h1>

                <p className="text-balance text-muted-foreground">
                  Login to system
                </p>
              </div>

              <FieldGroup>

                {/* EMAIL */}
                <form.Field
                  name="email"
                  children={(field) => {

                    const isInvalid =
                      field.state.meta.isTouched &&
                      !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>

                        <FieldLabel htmlFor={field.name}>
                          Email
                          <span className="text-red-500">*</span>
                        </FieldLabel>

                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(e.target.value)
                          }
                          aria-invalid={isInvalid}
                          placeholder="Enter your email"
                          autoComplete="off"
                        />

                        {isInvalid && (
                          <FieldError
                            errors={field.state.meta.errors}
                          />
                        )}

                      </Field>
                    );
                  }}
                />

                {/* PASSWORD */}
                <form.Field
                  name="password"
                  children={(field) => {

                    const isInvalid =
                      field.state.meta.isTouched &&
                      !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>

                        <FieldLabel htmlFor={field.name}>
                          Password
                          <span className="text-red-500">*</span>
                        </FieldLabel>

                        <Input
                          type="password"
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(e.target.value)
                          }
                          aria-invalid={isInvalid}
                          placeholder="Enter your password"
                          autoComplete="off"
                        />

                        {isInvalid && (
                          <FieldError
                            errors={field.state.meta.errors}
                          />
                        )}

                      </Field>
                    );
                  }}
                />

                {/* ERROR */}
                {error && (
                  <p className="text-red-500 text-sm">
                    {error}
                  </p>
                )}

              </FieldGroup>

              {/* LOGIN BUTTON */}
              <Field>
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Login"}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Don&apos;t have an account?
                <a href="#"> Sign up</a>
              </FieldDescription>

            </FieldGroup>
          </form>

          {/* RIGHT IMAGE */}
          <div className="relative hidden bg-muted md:block">
            <img
              src="/LEVA store logo.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />

          </div>

        </CardContent>
      </Card>
    </div>
  );
}