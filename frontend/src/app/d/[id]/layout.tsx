import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download File | JaldiBhejo",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
