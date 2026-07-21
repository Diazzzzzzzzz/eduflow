import { redirect } from "next/navigation";

// The three personas live at dedicated routes. Land on the teacher/centre view.
export default function Home() {
  redirect("/teacher");
}
