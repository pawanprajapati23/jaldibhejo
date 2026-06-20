import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support Us",
  description: "Keep JaldiBhejo free and fast. Donate via UPI or PayPal to support server and WebRTC relay costs.",
  alternates: {
    canonical: "/support",
  },
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
