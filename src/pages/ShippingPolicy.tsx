import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <BackButton className="mb-4" aria-label="Go back from Shipping Policy" />
          <h1 className="text-3xl font-bold">Shipping Policy</h1>
          <p className="mt-2 text-muted-foreground">
            Ranklao primarily provides digital services. If physical materials are shipped, the following policy applies.
          </p>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">1. Delivery Timelines</h2>
            <p className="text-muted-foreground">
              Physical shipments, if any, are typically dispatched within 3–5 business days. Delivery timelines depend on courier services and destination.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">2. Shipping Charges</h2>
            <p className="text-muted-foreground">
              Shipping fees, if applicable, are calculated at checkout based on weight, destination, and courier rates.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">3. Tracking</h2>
            <p className="text-muted-foreground">
              Tracking details will be shared via email/SMS once the shipment is dispatched.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">4. Damaged or Lost Items</h2>
            <p className="text-muted-foreground">
              For damaged or lost shipments, contact <a href="mailto:contact.ranklao@gmail.com" className="text-primary">contact.ranklao@gmail.com</a> within 7 days of receipt.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ShippingPolicy;