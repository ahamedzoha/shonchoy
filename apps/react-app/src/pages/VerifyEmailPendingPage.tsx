import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { CheckCircle, Clock, Mail } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { useResendVerificationEmailMutation } from "../store/apis";

export function VerifyEmailPendingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resendVerificationEmail, { isLoading }] =
    useResendVerificationEmailMutation();
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isResendSuccess, setIsResendSuccess] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  // Get email from location state or search params or default
  const emailFromState = location.state?.email;
  const emailFromParams = searchParams.get("email");
  const email = emailFromState || emailFromParams || "your email";

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (cooldownSeconds > 0) {
      interval = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldownSeconds]);

  const handleResend = async () => {
    if (cooldownSeconds > 0) return;

    try {
      await resendVerificationEmail({ email }).unwrap();
      setIsResendSuccess(true);
      setCooldownSeconds(120); // 2 minutes cooldown

      // Hide success message after 5 seconds
      setTimeout(() => setIsResendSuccess(false), 5000);
    } catch (err) {
      console.error("Failed to resend verification email:", err);
      const errorData = (err as { data?: { error?: string } })?.data;
      let errorMessage = "Failed to resend verification email.";

      if (errorData?.error) {
        if (errorData.error.includes("already verified")) {
          errorMessage = "This email address is already verified.";
        } else if (errorData.error.includes("wait")) {
          errorMessage = errorData.error; // Contains remaining time info
        } else {
          errorMessage = errorData.error;
        }
      }

      setResendMessage(errorMessage);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center">
            <Mail className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Check your email
            </h1>
            <p className="text-gray-600 mb-6">
              We sent a verification link to <strong>{email}</strong>
            </p>

            {isResendSuccess && (
              <Alert className="mb-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Verification email sent successfully!
                </AlertDescription>
              </Alert>
            )}

            {resendMessage && (
              <Alert
                variant={
                  resendMessage.includes("sent") ? "default" : "destructive"
                }
                className="mb-4"
              >
                <AlertDescription>{resendMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="text-sm text-gray-500">
                <p>Didn't receive the email?</p>
                <p>Check your spam folder or request a new one.</p>
              </div>

              <Button
                onClick={handleResend}
                disabled={isLoading || cooldownSeconds > 0}
                className="w-full"
              >
                {isLoading ? (
                  "Sending..."
                ) : cooldownSeconds > 0 ? (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Resend in {formatTime(cooldownSeconds)}
                  </>
                ) : (
                  "Resend verification email"
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="w-full"
              >
                Back to login
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
