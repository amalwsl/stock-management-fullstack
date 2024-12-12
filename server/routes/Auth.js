// routes/Auth.js
import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// Login route
router.post("/login", async (req, res) => {
  console.log("Login route hit");

  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    console.log(user);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      "your_secret_key", // This should be in .env for security
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
