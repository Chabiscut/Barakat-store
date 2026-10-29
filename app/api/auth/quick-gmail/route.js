import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, name } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name?.trim() || cleanEmail.split("@")[0];
    const defaultPassword = "BarakatCustomer2026!";

    // Pass the original request headers so better-auth can set cookies properly
    const headers = new Headers(request.headers);
    headers.set("host", request.headers.get("host") || "localhost:3000");

    let result;
    let isNewUser = false;

    // Try sign up first
    try {
      result = await getAuth().api.signUpEmail({
        body: {
          email: cleanEmail,
          password: defaultPassword,
          name: cleanName,
        },
        headers,
      });
      isNewUser = true;
    } catch {
      // Already registered - sign in instead
      try {
        result = await getAuth().api.signInEmail({
          body: {
            email: cleanEmail,
            password: defaultPassword,
          },
          headers,
        });
      } catch (signInError) {
        throw new Error(signInError.message || "Failed to authenticate.");
      }
    }

    // Build the response with the user data
    const responseData = {
      success: true,
      message: isNewUser
        ? `Welcome to Barakat Store, ${cleanName}!`
        : `Welcome back, ${cleanName}!`,
      user: {
        id: result?.user?.id,
        name: result?.user?.name || cleanName,
        email: result?.user?.email || cleanEmail,
      },
    };

    const response = NextResponse.json(responseData);

    // Forward any Set-Cookie headers from better-auth's response
    if (result?.headers) {
      const setCookies = result.headers.getSetCookie?.() || [];
      for (const cookie of setCookies) {
        response.headers.append("Set-Cookie", cookie);
      }
    }

    // Also try to set the session cookie directly if token is returned
    if (result?.token) {
      response.cookies.set("better-auth.session_token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return response;
  } catch (error) {
    console.error("Quick Gmail auth error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to authenticate." },
      { status: 500 }
    );
  }
}
