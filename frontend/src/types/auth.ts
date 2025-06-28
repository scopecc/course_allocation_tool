export interface SignInRequest {
  email?: string;
  employeeId?: string;
}

export interface SignInResponse {
  status: "success" | "error";
  message: string;
  otp?: number;
  employeeId?: string;
  error?: string;
}

export interface VerifyOtpRequest {
  employeeId: string;
  otp: number;
}

export interface VerifyOtpResponse {
  status: "success" | "error";
  message: string;
  error?: string;
}
