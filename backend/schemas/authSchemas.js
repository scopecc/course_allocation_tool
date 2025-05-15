import zod from "zod"

const signInSchema = zod.object({
    email: zod.string().email("Invalid email address"),
    otp: zod.string().length(6, "OTP must be 6 digits"),
})

export const authSchemas = {
    signInSchema,
}