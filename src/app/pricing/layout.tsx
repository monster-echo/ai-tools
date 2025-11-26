import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - AI Tools Plans",
  description:
    "Choose the perfect plan for your creative needs. Free credits available. Pro and Enterprise plans for power users.",
  openGraph: {
    title: "Pricing - AI Tools Plans",
    description: "Choose the perfect plan for your creative needs.",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "PricingTable",
            name: "AI Tools Subscription Plans",
            offers: [
              {
                "@type": "Offer",
                name: "Free",
                price: "0",
                priceCurrency: "USD",
                description: "For hobbyists and testing",
              },
              {
                "@type": "Offer",
                name: "Pro",
                price: "19",
                priceCurrency: "USD",
                description: "For creators and professionals",
              },
              {
                "@type": "Offer",
                name: "Enterprise",
                price: "99",
                priceCurrency: "USD",
                description: "For teams and businesses",
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
