import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { serialize } from "cookie";

const prisma = new PrismaClient();

export async function POST(req) {
  const { email } = await req.json();

  if (!email) return new Response(JSON.stringify({ success: false, message: "Email required" }), { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to avoid email enumeration
  if (!user) return new Response(JSON.stringify({ success: true, message: "If this email exists, a reset link was sent." }));

  const token = crypto.randomBytes(32).toString("hex");

  // Store token in cookie (HTTP only)
  const cookie = serialize("reset_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60, // 15 min
    path: "/",
  });

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  await transporter.sendMail({
    from: `"Support" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Password Reset",
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Expires in 15 minutes.</p>`,
  });

  return new Response(JSON.stringify({ success: true, message: "If this email exists, a reset link was sent." }), {
    status: 200,
    headers: { "Set-Cookie": cookie },
  });
}
