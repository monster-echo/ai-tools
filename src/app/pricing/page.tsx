"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { PayPalButton } from "@/components/paypal-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";

import { addCreditsAction } from "@/app/actions/user";

const initialOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
  currency: "USD",
  intent: "capture",
};

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePaymentSuccess = async (details: any, credits: number) => {
    const result = await addCreditsAction(credits);
    if (result.success) {
      alert(
        `Successfully added ${credits} credits! Transaction completed by ${details.payer.name.given_name}`
      );
    } else {
      alert(
        "Payment successful but failed to add credits. Please contact support."
      );
    }
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                  <Check className="h-4 w-4 text-green-500" /> 20 Credits / day
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> Standard Speed
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> Public
                  Generations
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline">
                Current Plan
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="flex flex-col border-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg">
              Popular
            </div>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>For creators and professionals</CardDescription>
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
                  <Check className="h-4 w-4 text-green-500" /> 2000 Credits /
                  month
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> Fast Generation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> Private
                  Generations
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> Priority Support
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              {selectedPlan === "pro" ? (
                <div className="w-full">
                  <PayPalButton
                    amount="19.99"
                    onSuccess={(details) => handlePaymentSuccess(details, 2000)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPlan(null)}
                    className="mt-2 w-full"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => setSelectedPlan("pro")}
                >
                  Upgrade to Pro
                </Button>
              )}
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
                  <Check className="h-4 w-4 text-green-500" /> 12,000 Credits /
                  month
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> Fastest Speed
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> API Access
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> Dedicated Support
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              {selectedPlan === "enterprise" ? (
                <div className="w-full">
                  <PayPalButton
                    amount="99.99"
                    onSuccess={(details) =>
                      handlePaymentSuccess(details, 12000)
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPlan(null)}
                    className="mt-2 w-full"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setSelectedPlan("enterprise")}
                >
                  Contact Sales
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
