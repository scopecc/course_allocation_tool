"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
} from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import axios, { AxiosResponse } from "axios";
import {
  SignInRequest,
  SignInResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from "@/types/auth";
import { ControlledOTPInput } from "@/components/auth";
import { Loader } from "@/components";
import { useRouter } from "next/navigation";
import { APIError } from "@/types/error";

const SignInPage = () => {
  const { register, handleSubmit } = useForm<SignInRequest>();

  const router = useRouter();

  const [isVerified, setIsVerified] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [otp, setOtp] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sign In Handler
  const onSignIn = async (data: SignInRequest) => {
    setIsLoading(true);
    if (!data.employeeId) {
      toast.error("Please fill the Employee ID Field");
      setIsLoading(false);
      return;
    }
    try {
      const response: AxiosResponse<SignInResponse> = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signin`,
        data
      );

      if (process.env.NODE_ENV === 'development') {
        console.log("Sign In Response: ", response.data);
      }

      if (response.data.status === "success") {
        setIsVerified(true);
        setEmployeeId(response.data.employeeId || data.employeeId || "");
        toast.success(response.data.message);
      } else {
        toast.error(
          response.data.message || response.data.error || "Sign in failed"
        );
      }
    } catch (error) {
      const err = error as APIError;
      toast.error(err.response?.data?.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Verify Handler
  const onVerifyOtp = async () => {
    setIsLoading(true);
    if (!otp || !employeeId) {
      toast.error("Please enter the OTP");
      return;
    }
    const payload: VerifyOtpRequest = { employeeId, otp };
    try {
      const response: AxiosResponse<VerifyOtpResponse> = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`,
        payload,
        {
          withCredentials: true,
        }
      );
      if (response.data.status === "success") {
        toast.success(response.data.message);
        localStorage.setItem("user", JSON.stringify(response.data.message));
        router.push("/dashboard");
      } else {
        toast.error(
          response.data.message ||
          response.data.error ||
          "OTP verification failed"
        );
      }
    } catch (error) {
      const err = error as APIError;
      toast.error(err.response?.data?.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen">
      {!isVerified && (
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Sign In with your credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSignIn)}>
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee Id</Label>
                <Input {...register("employeeId")} id="employeeId" />
              </div>
              <CardFooter className="flex justify-end p-0 pt-4">
                <Button type="submit">
                  {isLoading ? <Loader /> : "Sign In"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      )}
      {isVerified && (
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Verify OTP</CardTitle>
            <CardDescription>Enter the OTP sent to your email</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ControlledOTPInput otp={otp!} setOtp={setOtp} />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={onVerifyOtp}>
              {isLoading ? <Loader /> : "Verify OTP"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default SignInPage;
