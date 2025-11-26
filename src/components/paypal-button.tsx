"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

interface PayPalButtonProps {
  amount: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess: (details: any) => void;
}
const initialOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  currency: "USD",
  intent: "capture",
};
export function PayPalButton({ amount, onSuccess }: PayPalButtonProps) {
  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalButtons
        style={{ layout: "vertical", disableMaxWidth: true }}
        createOrder={(data, actions) => {
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  currency_code: "USD",
                  value: amount,
                },
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order!.capture().then((details) => {
            onSuccess(details);
          });
        }}
      />
    </PayPalScriptProvider>
  );
}
