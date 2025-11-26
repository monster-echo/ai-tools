import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Studio - AI Text to Image Generator",
  description:
    "Create stunning AI art with our advanced Image Studio. Support for Flux, SDXL, and various artistic styles.",
  openGraph: {
    title: "Image Studio - AI Text to Image Generator",
    description: "Create stunning AI art with our advanced Image Studio.",
  },
};

export default function ImageStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
