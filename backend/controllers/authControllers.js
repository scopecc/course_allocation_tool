import jwt from "jsonwebtoken";
import { authSchemas } from "../schemas/index.js";
import { Teachers } from "../models/index.js";
import sendMail from "../utilities/nodemailer.js";

async function signIn(req, res) {
  const { email, employeeId } = req.body;

  const validationResult = authSchemas.signInSchema.safeParse({
    email,
    employeeId,
  });
  if (!validationResult.success) {
    return res.status(400).json({
      status: "error",
      error: "Invalid input",
      message: validationResult.error.format(),
    });
  }

  try {
    const existingUser = await Teachers.findOne({
      $or: [{ email: email }, { employeeId: employeeId }],
    });
    if (!existingUser) {
      return res.status(404).json({
        status: "error",
        error: "User not found",
        message: "No user found with this email",
      });
    } else {
      const otp = Math.floor(100000 + Math.random() * 900000);
      const updatedUser = await Teachers.findOneAndUpdate(
        { email: email },
        { otp: otp },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(500).json({
          status: "error",
          error: "Database error",
          message: "Failed to update OTP, try again",
        });
      }
      try {
        console.log("Sending OTP to email: ", existingUser.email);
        await sendMail(
          existingUser.email,
          "OTP for Sign In",
          `Your OTP for sign in is ${otp}. Please use this OTP to complete your sign in process.`
        );
        return res.status(200).json({
          status: "success",
          message: "OTP sent to your email",
          otp: otp,
          employeeId: employeeId || existingUser.employeeId,
        });
      } catch (err) {
        return res.status(500).json({
          status: "error",
          error: "Unable to send OTP, please try again!",
          message: err.message,
        });
      }
    }
  } catch (err) {
    return res.status(500).json({
      status: "error",
      error: "Database error",
      message: err.message,
    });
  }
}

async function verifyOtp(req, res) {
  const { employeeId, otp } = req.body;
  const validationResult = authSchemas.verifyOtpSchema.safeParse({
    employeeId,
    otp,
  });
  if (!validationResult.success) {
    return res.status(400).json({
      status: "error",
      error: "Invalid input",
      message: validationResult.error.format(),
    });
  }
  try {
    const user = await Teachers.findOne({ employeeId: employeeId });
    if (!user) {
      return res.status(404).json({
        status: "error",
        error: "User not found",
        message: "No user found with this employee ID",
      });
    }
    if (user.otp !== otp) {
      return res.status(400).json({
        status: "error",
        error: "Invalid OTP",
        message: "The OTP you entered is incorrect",
      });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.status(200).json({
      status: "success",
      message: "OTP verified successfully",
      token: token,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      error: "Database error",
      message: err.message,
    });
  }
}

export default {
  signIn,
  verifyOtp,
};
