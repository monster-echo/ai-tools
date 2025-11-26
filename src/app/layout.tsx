import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: {
    default: "AI Tools - Advanced Generative AI Platform",
    template: "%s | AI Tools",
  },
  description:
    "Unleash your creativity with AI Tools. Generate stunning images, edit with precision, and explore the future of digital art using Flux and SDXL models.",
  keywords: [
    "AI",
    "Generative AI",
    "Image Generation",
    "Flux",
    "SDXL",
    "AI Art",
    "Text to Image",
  ],
  authors: [{ name: "AI Tools Team" }],
  creator: "AI Tools Inc.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ai-tools.com",
    siteName: "AI Tools",
    title: "AI Tools - Advanced Generative AI Platform",
    description:
      "Generate stunning images and explore the future of digital art.",
    images: [
      {
        url: "/og-image.jpg", // Assuming we might have one, or user can add later
        width: 1200,
        height: 630,
        alt: "AI Tools Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tools - Advanced Generative AI Platform",
    description:
      "Generate stunning images and explore the future of digital art.",
    creator: "@aitools",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AI Tools",
    url: "https://ai-tools.com",
    logo: "https://ai-tools.com/logo.png",
    sameAs: ["https://twitter.com/aitools", "https://github.com/aitools"],
    description: "A leading platform for generative AI tools and services.",
  };

  return (
    <ClerkProvider>
      <html lang="en">
        <body
        // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
