"use client";

import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useEffect } from "react";

interface PayPalButtonProps {
  amount: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess: (details: any) => void;
}

export function PayPalButton({ amount, onSuccess }: PayPalButtonProps) {
  const [{ options, isPending }, dispatch] = usePayPalScriptReducer();

  useEffect(() => {
    dispatch({
      // @ts-expect-error - resetOptions is a valid action but types might be outdated
      type: "resetOptions",
      value: {
        ...options,
        currency: "USD",
      },
    });
  }, [amount, dispatch, options]);

  return (
    <>
      {isPending ? <div className="spinner" /> : null}
      <PayPalButtons
        style={{ layout: "vertical" }}
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
    </>
  );
}
