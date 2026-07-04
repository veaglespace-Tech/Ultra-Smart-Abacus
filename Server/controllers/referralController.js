import crypto from "crypto";
import prisma from "../config/prisma.js";

export const createReferral = async (req, res) => {
  try {
    // Logged in user
    const userId = req.user.id;

    // Find franchise of logged in user
    const franchise = await prisma.franchise.findUnique({
      where: {
        userId,
      },
    });

    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: "Franchise not found.",
      });
    }

    // Generate random token
    const token = crypto.randomBytes(16).toString("hex");

    // Expire after 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create referral
    const createreferral = await prisma.referral.create({
      data: {
        token,
        role: req.body.role,
        franchiseId: franchise.id,
        expiresAt,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Referral generated successfully.",
      data: referral,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};