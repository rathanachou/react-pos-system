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
      setIsLoading(true);
      setError("");

      loginMutate(value, {
        onSuccess: (res) => {
          // axios interceptor unwraps response.data, so res = { message, data: { token } }
          const token = res?.data?.token;
          if (token) {
            setAccessToken(token);
            const role = getRole();
            if (role === "admin") {
              navigate("/admin/dashboard", { replace: true });
            } else {
              navigate("/admin/pos", { replace: true });
            }
          } else {
            setError("Token not found in response");
          }
        },
        onError: () => {
          setError("Invalid email or password");
        },
        onSettled: () => {
          setIsLoading(false);
        },
      });
    },
  });

  return (
    <>
      <div className={cn("flex flex-col gap-6", className)} {...props}>
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
                  <h1 className="text-2xl font-bold">Welcome back</h1>
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
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            Email<span className="text-red-500">*</span>
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="Enter your email"
                            autoComplete="off"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
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
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            Password<span className="text-red-500">*</span>
                          </FieldLabel>
                          <Input
                            type="password"
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="Enter your password"
                            autoComplete="off"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  />

                  {/* ERROR */}
                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}

                </FieldGroup>

                {/* LOGIN BUTTON */}
                <Field>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Loading..." : "Login"}
                  </Button>
                </Field>

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

    
    </>
  );
}