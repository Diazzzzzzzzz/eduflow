import { redirect } from "next/navigation";

// Middleware normally handles "/", redirecting to the role dashboard or /login.
// This is a fallback for when middleware doesn't run.
export default function Home() {
  redirect("/login");
}
