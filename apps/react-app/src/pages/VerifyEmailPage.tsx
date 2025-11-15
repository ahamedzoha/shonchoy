import { useEffect, useRef, useState } from "react";

import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useVerifyEmailMutation } from "../store/apis";

type VerificationState = "verifying" | "success" | "error";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifyEmail, { error }] = useVerifyEmailMutation();
  const [state, setState] = useState<VerificationState>("verifying");

  // Use ref to track if we've already called the API to prevent double calls
  const hasCalledApi = useRef(false);

  const token = searchParams.get("token");

  useEffect(() => {
    // Only run verification once per page load
    if (hasCalledApi.current || !token) {
      if (!token) {
        setState("error");
      }
      return;
    }

    hasCalledApi.current = true;

    const verifyEmailToken = async () => {
      try {
        await verifyEmail(token).unwrap();
        setState("success");
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch {
        setState("error");
      }
    };

    verifyEmailToken();
  }, [token, verifyEmail, navigate]);

  const handleResendEmail = () => {
    navigate("/verify-email-pending");
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center">
            {state === "verifying" && (
              <>
                <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Verifying your email...
                </h1>
                <p className="text-gray-600">
                  Please wait while we verify your email address.
                </p>
              </>
            )}

            {state === "success" && (
              <>
                <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Email verified!
                </h1>
                <p className="text-gray-600 mb-4">
                  Your email address has been successfully verified.
                </p>
                <p className="text-sm text-gray-500">
                  Redirecting to login page...
                </p>
              </>
            )}

            {state === "error" && (
              <>
                <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Verification failed
                </h1>
                <Alert className="mb-4">
                  <AlertDescription>
                    {error && "data" in error && error.data
                      ? (error.data as { message?: string }).message ||
                        "Verification failed. Please try again."
                      : "Verification failed. Please try again."}
                  </AlertDescription>
                </Alert>
                <div className="space-y-3">
                  <Button onClick={handleResendEmail} className="w-full">
                    Request new verification link
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleGoToLogin}
                    className="w-full"
                  >
                    Back to login
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
