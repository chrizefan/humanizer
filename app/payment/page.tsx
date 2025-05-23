import { Metadata } from "next";
import PaymentForm from "@/components/payment/payment-form";

export const metadata: Metadata = {
  title: "Payment - AI Humanizer",
  description: "Subscribe to AI Humanizer and start transforming your content.",
};

export default function PaymentPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <PaymentForm />
    </div>
  );
}