import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { parse } from "cookie";

const prisma = new PrismaClient();

export async function POST(req) {
  const body = await req.json();
  const { email, password, token } = body;

  if (!email || !password || !token)
    return new Response(JSON.stringify({ success: false, message: "Missing data" }), { status: 400 });

  // Read cookie from headers
  const cookiesHeader = req.headers.get("cookie") || "";
  const cookies = parse(cookiesHeader);
  const cookieToken = cookies.reset_token;

  if (!cookieToken || cookieToken !== token)
    return new Response(JSON.stringify({ success: false, message: "Invalid or expired token" }), { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return new Response(JSON.stringify({ success: false, message: "User not found" }), { status: 404 });

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashedPassword },
  });

  // Clear reset_token cookie
  return new Response(JSON.stringify({ success: true, message: "Password updated successfully" }), {
    status: 200,
    headers: { "Set-Cookie": "reset_token=; Max-Age=0; path=/; HttpOnly" },
  });
}
