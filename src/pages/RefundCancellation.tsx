import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { Link } from "react-router-dom";

const RefundCancellation = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <BackButton className="mb-4" aria-label="Go back from Refund & Cancellation" />
          <h1 className="text-3xl font-bold">Refund and Cancellation Policy</h1>
          <p className="mt-2 text-muted-foreground">
            This page outlines Ranklao’s guidelines and procedures regarding refunds and cancellations of orders or services.
            These policies comply with RBI-mandated rules and are followed during our verification processes.
          </p>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">1. Refund Eligibility</h2>
            <p className="text-muted-foreground">
              Refunds may be eligible for unused or undelivered services, failed transactions, or other cases as specified in service-specific terms. 
              Refund eligibility is assessed on a case-by-case basis and may require supporting documentation.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">2. Refund Timeframes</h2>
            <p className="text-muted-foreground">
              Approved refunds are typically processed within 5–7 business days. Actual settlement timelines may vary based on your bank, payment gateway, or card issuer.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">3. Refund Request Process</h2>
            <p className="text-muted-foreground">
              To request a refund, please email <a href="mailto:contact.ranklao@gmail.com" className="text-primary">contact.ranklao@gmail.com</a> with your registered email, transaction reference, and a brief description of the issue. 
              Our team will acknowledge your request and provide updates on the resolution.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">4. Cancellation Procedures</h2>
            <p className="text-muted-foreground">
              You may cancel booked sessions or services subject to the applicable cancellation window. Cancellations made within the permitted timeframe are processed without penalty; cancellations outside the window may incur fees.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">5. Fees and Requirements</h2>
            <p className="text-muted-foreground">
              Certain cancellations or refunds may be subject to administrative fees or deduction of payment gateway charges. 
              Additional verification (such as ID proof or transaction screenshots) may be required to process requests.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">6. RBI Compliance</h2>
            <p className="text-muted-foreground">
              Our refund and cancellation processes comply with RBI guidelines. We adhere to applicable regulations during user verification and transaction handling.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">7. Contact</h2>
            <p className="text-muted-foreground">
              For any questions regarding this policy, please reach out at <a href="mailto:contact.ranklao@gmail.com" className="text-primary">contact.ranklao@gmail.com</a> or visit our <Link to="/contact" className="text-primary">Contact Us</Link> page.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default RefundCancellation;