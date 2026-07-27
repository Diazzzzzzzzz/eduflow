import { UiThemeBoot } from "@/components/layout/ui-theme-boot";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="canvas-grid flex min-h-screen flex-col items-center justify-center px-4 py-10">
      {/* Sign-in renders outside AppProvider, so the saved theme is applied here. */}
      <UiThemeBoot />
      {children}
    </div>
  );
}
