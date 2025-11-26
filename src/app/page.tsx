import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { checkDailyRewardAction } from "@/app/actions/user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Sparkles, Zap, Image as ImageIcon, Shield, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Home - Create Amazing AI Art",
  description:
    "Start your journey with AI Tools. Access powerful text-to-image generation, image editing, and more. Free credits available for new users.",
  alternates: {
    canonical: "https://ai-tools.com",
  },
};

export default async function Home() {
  const { userId } = await auth();
  let credits = 0;
  let plan = "Free";

  if (userId) {
    // Check for daily reward
    await checkDailyRewardAction();

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    if (user) {
      credits = user.credits;
      if (credits >= 10000) plan = "Enterprise";
      else if (credits >= 1000) plan = "Pro";
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "AI Tools Image Studio",
            applicationCategory: "DesignApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              ratingCount: "1024",
            },
          }),
        }}
      />
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4 md:px-6 mx-auto">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Sparkles className="h-6 w-6 text-primary" />
            <span>AI Tools</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <Link
              href="#features"
              className="hover:underline underline-offset-4"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="hover:underline underline-offset-4"
            >
              Pricing
            </Link>
            <Link
              href="/features/image-studio"
              className="hover:underline underline-offset-4"
            >
              Image Studio
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {userId ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-700 hover:bg-purple-100"
                  >
                    {plan}
                  </Badge>
                  <Badge variant="outline">{credits} pts</Badge>
                </div>
                <UserButton />
              </div>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 px-auto">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-black text-white">
          <div className="container px-4 md:px-6 mx-auto ">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Unleash Your Creativity with AI
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
                  Generate stunning images, edit with precision, and explore the
                  future of digital art with our advanced AI tools.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/features/image-studio">
                  <Button
                    className="bg-white text-black hover:bg-gray-200"
                    size="lg"
                  >
                    Try Image Studio
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    variant="outline"
                    className="text-white bg-black hover:bg-black/60 hover:text-white hover:font-semibold"
                    size="lg"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="w-full  py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Everything you need to create
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Our platform provides a suite of powerful tools designed to
                  help you generate and manipulate images with ease.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardHeader>
                  <ImageIcon className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Text to Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Turn your words into breathtaking visuals using
                    state-of-the-art models like Flux and SDXL.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Zap className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Fast Generation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Experience lightning-fast generation times without
                    compromising on quality.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Secure & Private</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Your creations are yours. We prioritize your privacy and
                    data security.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Simple, Transparent Pricing
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Choose the plan that fits your needs.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-12">
              {/* Free Plan */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <CardDescription>For hobbyists and testing</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-3xl font-bold mb-6">
                    $0
                    <span className="text-sm font-normal text-muted-foreground">
                      /mo
                    </span>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" /> 20 Credits /
                      day
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" /> Standard
                      Speed
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" /> Public
                      Generations
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/sign-up" className="w-full">
                    <Button className="w-full" variant="outline">
                      Get Started
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Pro Plan */}
              <Card className="flex flex-col border-primary relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg">
                  Popular
                </div>
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                  <CardDescription>
                    For creators and professionals
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-3xl font-bold mb-6">
                    $19.99
                    <span className="text-sm font-normal text-muted-foreground">
                      /mo
                    </span>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" /> 2000 Credits
                      / month
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" /> Fast
                      Generation
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" /> Private
                      Generations
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" /> Priority
                      Support
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/pricing" className="w-full">
                    <Button className="w-full">Subscribe</Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Enterprise Plan */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <CardDescription>For teams and businesses</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-3xl font-bold mb-6">
                    $99.99
                    <span className="text-sm font-normal text-muted-foreground">
                      /mo
                    </span>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" /> 12,000
                      Credits / month
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" /> Fastest Speed
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" /> API Access
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" /> Dedicated
                      Support
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/pricing" className="w-full">
                    <Button className="w-full" variant="outline">
                      Contact Sales
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section
          id="about"
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  About AI Tools
                </h2>
                <p className="text-gray-500 dark:text-gray-400 md:text-xl/relaxed">
                  We are a team of passionate developers and artists dedicated
                  to democratizing AI art creation. Our mission is to provide
                  powerful, accessible tools that empower creators to bring
                  their imagination to life.
                </p>
                <p className="text-gray-500 dark:text-gray-400 md:text-xl/relaxed">
                  Founded in 2025, we leverage the latest advancements in
                  generative AI to deliver high-quality results with an
                  intuitive user experience.
                </p>
                <div className="flex gap-4">
                  <Link href="/features/image-studio">
                    <Button variant="outline">Meet the Team</Button>
                  </Link>
                  <a href="mailto:rwecho@live.com">
                    <Button>Contact Us</Button>
                  </a>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative w-full max-w-[500px] aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center shadow-xl">
                  <Sparkles className="h-20 w-20 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2025 AI Tools Inc. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
