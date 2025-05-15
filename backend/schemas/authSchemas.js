import zod from "zod";

const signInSchema = zod
  .object({
    email: zod.string().email("Invalid email address").optional(),
    employeeId: zod.string().min(1, "Employee ID is required").optional(),
  })
  .refine((data) => data.employeeid || data.email, {
    message: "Either employeeid or email must be provided",
    path: ["employeeid", "email"],
  });

const verifyOtpSchema = zod.object({
  employeeId: zod.string().min(1, "Employee ID is required"),
  otp: zod.number().max(999999, "OTP must be a 6 digit number").min(100000, "OTP must be a 6 digit number"),
});

export default {
  signInSchema,
  verifyOtpSchema,
};
