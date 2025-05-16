import zod from "zod";

const signInSchema = zod.object({
  email: zod.string().email().optional(),
  employeeId: zod.string().optional(),
});

const verifyOtpSchema = zod.object({
  employeeId: zod.string().min(1, "Employee ID is required"),
  otp: zod
    .number()
    .max(999999, "OTP must be a 6 digit number")
    .min(100000, "OTP must be a 6 digit number"),
});

export default {
  signInSchema,
  verifyOtpSchema,
};
