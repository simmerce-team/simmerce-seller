"use client";

import { checkEmailExists } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateEmail = useCallback((value: string) => {
    // Basic but robust email regex; complements HTML5 validation
    const re = /^(?:[a-zA-Z0-9_'^&/+-])+(?:\.(?:[a-zA-Z0-9_'^&/+-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return re.test(value);
  }, []);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const isValid = useMemo(() => (normalizedEmail ? validateEmail(normalizedEmail) : false), [normalizedEmail, validateEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!normalizedEmail || !isValid || isLoading) return;

    setIsLoading(true);
    try {
      const userExists = await checkEmailExists(normalizedEmail);

      if (userExists) {
        router.push(`/auth/login?email=${encodeURIComponent(normalizedEmail)}`);
      } else {
        router.push(`/auth/signup?email=${encodeURIComponent(normalizedEmail)}`);
      }
    } catch (error) {
      console.error("Error checking user:", error);
      toast("An error occurred", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome to Simmerce</CardTitle>
          <CardDescription>Enter your email to get started</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                placeholder="name@yourbusiness.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => setEmail(e.target.value.trim().toLowerCase())}
                required
                aria-invalid={email.length > 0 && !isValid}
                aria-describedby="email-help"
                className="w-full"
              />
              <p id="email-help" className="text-xs text-muted-foreground">
                Use your business email (e.g., name@company.com)
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isValid}
              onMouseEnter={() => {
                // Prefetch the most likely route for snappy nav
                if (isValid) {
                  const next = `/auth/login?email=${encodeURIComponent(normalizedEmail)}`;
                  const alt = `/auth/signup?email=${encodeURIComponent(normalizedEmail)}`;
                  try {
                    router.prefetch(next);
                    router.prefetch(alt);
                  } catch {}
                }
              }}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
