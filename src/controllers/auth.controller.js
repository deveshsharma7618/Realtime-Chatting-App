import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../config/env.js";
import sendRegisterEmail from "../services/sendRegisterEmail.js";
import sendLoginEmail from "../services/sendLoginEmail.js";
import sendOTPEmail from "../services/sendOtp.js";
import TempUser from "../models/temp_user.model.js";


export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await TempUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser = new TempUser({
      username,
      email,
      password: hash,
    });

    await newUser.save();
    // const otp = await sendOTPEmail(email, username).catch((error) => {
    //   console.error("Error sending registration email:", error);
    // });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    newUser.otp = otp;
    newUser.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        status: newUser.status,
      },
      config.jwtSecret,
      {
        expiresIn: config.jwtExpiresIn,
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });


    res.status(201).json({
      success: true,
      message: "Otp sent successfully",
      data: {
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userAgent = req.get("user-agent") || "Unknown device";
    const forwardedFor = req.headers["x-forwarded-for"];
    const ipAddress = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(",")[0]?.trim() ||
      req.ip ||
      req.socket?.remoteAddress ||
      "Unknown";

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }


    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        status: user.status ?? "verified",
      },
      config.jwtSecret,
      {
        expiresIn: config.jwtExpiresIn,
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // void sendLoginEmail(user.email, user.username, {
    //   ipAddress,
    //   userAgent,
    //   loginAt: new Date(),
    // }).catch((error) => {
    //   console.error("Error sending login email:", error);
    // });



    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        status: user.status,
      },
      token: token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const { email, status } = req.user;
    const user = await TempUser.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }


    if (user.status === "verified") {
      return res.status(400).json({ error: "User is already verified" });
    }

    if (user.otp != otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ error: "OTP has expired" });
    }


    const newUser = new User({
      username: user.username,
      email: user.email,
      password: user.password,
    });

    await newUser.save();
    await TempUser.deleteOne({ _id: user._id });

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        status: "verified",
      },
      config.jwtSecret,
      {
        expiresIn: config.jwtExpiresIn,
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });



    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const session = async (req, res) => {
  try {
    const { id, email, status } = req.user;
    res.status(200).json({
      success: true,
      user: {
        id,
        email,
      },
      status: status ?? "verified",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  register,
  login,
  verifyOtp,
  session,
};
