export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="canvas-grid flex min-h-screen flex-col items-center justify-center px-4 py-10">
      {children}
    </div>
  );
}
