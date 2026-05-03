import { Metadata } from "next";
import LoginClient from "./login-client";
export const metadata: Metadata = { title: "Admin Login" };
export default function LoginPage() {
  return <LoginClient />;
}
