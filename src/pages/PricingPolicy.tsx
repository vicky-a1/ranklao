import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";

const PricingPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <BackButton className="mb-4" aria-label="Go back from Pricing Policy" />
          <h1 className="text-3xl font-bold">Pricing Policy</h1>
          <p className="mt-2 text-muted-foreground">
            This Pricing Policy describes how fees are calculated and charged for mentorship sessions, subscriptions, and other services offered on Ranklao.
          </p>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">1. Session Pricing</h2>
            <p className="text-muted-foreground">
              Session prices are set by mentors within platform guidelines. Final charges may include taxes and payment gateway fees where applicable.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">2. Taxes and Fees</h2>
            <p className="text-muted-foreground">
              Prices shown are exclusive of applicable taxes. GST or other taxes, along with payment gateway charges, may be added at checkout.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">3. Discounts and Offers</h2>
            <p className="text-muted-foreground">
              Promotional discounts may apply during campaigns. Offer terms and eligibility are specified at the time of promotion.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">4. Refunds</h2>
            <p className="text-muted-foreground">
              Refunds, where applicable, follow our <a href="/refund-cancellation" className="text-primary">Refund & Cancellation</a> policy.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PricingPolicy;