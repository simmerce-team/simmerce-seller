"use client";

import { signUp } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AccountInfoStep,
  AddressInfoStep,
  BusinessInfoStep,
} from "./components";

interface BusinessType {
  id: string;
  name: string;
  description: string | null;
}

function SignUpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending] = useTransition(); 
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [isLoadingBusinessTypes, setIsLoadingBusinessTypes] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "",
    password: "",
    phone: "",
    businessName: "",
    businessTypeId: "",
    gstNumber: "",
    address: "",
    city: "",
    cityId: "",
    state: "",
    stateId: "",
    pincode: "",
  });

  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        const { getBusinessTypes } = await import("@/actions/auth");
        const businessTypes = await getBusinessTypes();
        setBusinessTypes(businessTypes);
      } catch (error) {
        toast.error(
          "Failed to load business types. Please refresh the page or try again later."
        );
      } finally {
        setIsLoadingBusinessTypes(false);
      }
    };

    fetchBusinessTypes();
  }, []);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (!formData.fullName) {
        toast("Full name is required");
        return;
      }

      if (!formData.phone) {
        toast("Phone number is required");
        return;
      }

      if (!formData.password) {
        toast("Password is required");
        return;
      }

      if (formData.password.length < 8) {
        toast("Password must be at least 8 characters");
        return;
      }

    }

    if (step === 2) {
      if (!formData.businessName) {
        toast("Business name is required");
        return;
      }

      if (!formData.businessTypeId) {
        toast("Please select a business type");
        return;
      }
    }

    if (step === 3) {
      if (
        !formData.address ||
        !formData.city ||
        !formData.state ||
        !formData.pincode
      ) {
        toast("Please fill in all address fields");
        return;
      }

      setIsSubmitting(true);

      try {
        const result = await signUp({
          email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
          businessName: formData.businessName,
          businessTypeId: formData.businessTypeId,
          gstNumber: formData.gstNumber,
          address: formData.address,
          city: formData.city,
          cityId: formData.cityId,
          state: formData.state,
          stateId: formData.stateId,
          pincode: formData.pincode,
        });

        if (!result.success) {
          throw new Error(result.error || "Sign up failed");
        }

        router.push("/dashboard");
      } catch (error) {
        console.error("Signup error:", error);
        toast(
          error instanceof Error
            ? error.message
            : "An error occurred during signup"
        );
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    setStep((prev) => prev + 1);
  };

  const goBack = () => {
    if (step === 1) {
      router.push("/auth");
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const steps = [
    {
      component: (
        <AccountInfoStep
          formData={{
            fullName: formData.fullName,
            password: formData.password,
            phone: formData.phone,
          }}
          handleChange={handleChange}
          isSubmitting={isSubmitting}
          isPending={isPending}
        />
      ),
    },
    {
      component: (
        <BusinessInfoStep
          formData={{
            businessName: formData.businessName,
            businessTypeId: formData.businessTypeId,
            gstNumber: formData.gstNumber,
          }}
          businessTypes={businessTypes}
          isLoadingBusinessTypes={isLoadingBusinessTypes}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          isSubmitting={isSubmitting}
          isPending={isPending}
        />
      ),
    },
    {
      component: (
        <AddressInfoStep
          formData={{
            address: formData.address,
            city: formData.city,
            cityId: formData.cityId,
            state: formData.state,
            stateId: formData.stateId,
            pincode: formData.pincode,
          }}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          isSubmitting={isSubmitting}
          isPending={isPending}
        />
      ),
    },
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription className="text-center">
            <Progress value={step * 33} />
            <br />
            {step === 1 && `Sign up with ${email}`}
            {step === 2 && "Tell us about your business"}
            {step === 3 && "Where is your business located?"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep.component}

            <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={goBack}
                  className="text-muted-foreground"
                  disabled={step === 1}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>

              <Button
                type="submit"
                className="ml-auto"
                disabled={isPending || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {step === steps.length
                      ? "Creating account..."
                      : "Processing..."}
                  </>
                ) : step === steps.length ? (
                  "Create account"
                ) : (
                  "Continue"
                )}
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href={`/auth/login?email=${encodeURIComponent(email)}`}
                className="text-primary hover:underline"
              >
                Log in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
