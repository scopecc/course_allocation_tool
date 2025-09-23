import jwt from "jsonwebtoken";
import { authSchemas } from "../schemas/index.js";
import { Users } from "../models/index.js";
import sendMail from "../utilities/nodemailer.js";

async function signIn(req, res) {
  const { employeeId } = req.body;
  if (!employeeId) {
    return res.status(400).json({
      status: "error",
      error: "Invalid input",
      message: "Please provide employee ID",
    });
  }

  try {
    const existingUser = await Users.findOne({
      employeeId: employeeId,
    });
    if (!existingUser) {
      return res.status(404).json({
        status: "error",
        error: "User not found",
        message: "No user found with this employee ID",
      });
    } else {
      const otp = Math.floor(100000 + Math.random() * 900000);
      const updatedUser = await Users.findOneAndUpdate(
        { email: existingUser.email },
        { otp: otp },
        { new: true },
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
          `Your OTP for sign in is ${otp}. Please use this OTP to complete your sign in process.`,
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
      message:
        validationResult.error.format().otp?._errors[0] ||
        validationResult.error.format().employeeId?._errors[0],
    });
  }
  try {
    const user = await Users.findOne({ employeeId: employeeId });
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

    const token = jwt.sign(
      { userId: user._id, employeeId: user.employeeId, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "100m",
      },
    );
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 100 * 60 * 1000, // 100 minutes for now
      domain: ".scopevitcc.in",
      path: "/",
    });
    return res.status(200).json({
      status: "success",
      message: "OTP verified successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      error: "Database error",
      message: err.message,
    });
  }
}

async function me(req, res) {
  const token = req.cookies.auth_token;
  if (!token) {
    console.log("Unauthorized: No Token Provided.");
    return res.status(401).json({ error: "Unauthorized: No Token Provided" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({
      user: {
        userId: payload.userId,
        employeeId: payload.employeeId,
        email: payload.email,
      },
    });
  } catch (err) {
    console.log("Forbidden: Invalid token");
    return res.status(403).json({ error: "Forbidden: Invalid token" });
  }
}

async function logout(req, res) {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  res.json({ message: "Logged out" });
}

export default {
  signIn,
  verifyOtp,
  me,
  logout,
};
