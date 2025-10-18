import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <BackButton className="mb-4" aria-label="Go back from Terms" />
          <h1 className="text-3xl font-bold">Terms and Conditions</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome to Ranklao. By accessing or using our platform, you agree to these Terms and Conditions. Please
            read them carefully.
          </p>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By using Ranklao, you confirm that you are at least 13 years of age (or the minimum age required by law
              in your jurisdiction) and have read and accepted these Terms. If you do not agree, do not use the
              platform.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">2. Accounts and Access</h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account credentials and for all
              activities under your account. We may suspend or terminate access if we detect misuse or policy
              violations.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">3. Mentor Services</h2>
            <p className="text-muted-foreground">
              Mentors provide guidance based on their expertise and experience. Ranklao does not guarantee outcomes,
              exam results, or any specific achievements. Sessions must adhere to our community standards.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">4. Payments and Refunds</h2>
            <p className="text-muted-foreground">
              Payments are processed via integrated gateways (e.g., Razorpay). Successful payment grants access to
              applicable services. Refunds are handled per our refund policy; certain services may be non-refundable.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">5. Prohibited Conduct</h2>
            <p className="text-muted-foreground">
              You agree not to engage in harassment, hate speech, cheating, unlawful activities, or any actions that
              compromise platform security or integrity. Violation may result in immediate suspension.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">6. Intellectual Property</h2>
            <p className="text-muted-foreground">
              Content, trademarks, and materials on Ranklao are protected by intellectual property laws. You may not
              copy, distribute, or create derivative works without prior permission.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">7. Privacy</h2>
            <p className="text-muted-foreground">
              We process personal data in accordance with our Privacy Policy. By using Ranklao, you consent to such
              processing.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Ranklao is not liable for indirect, incidental, or consequential damages arising from use of the
              platform. Services are provided on an “as is” and “as available” basis.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">9. Disclaimers</h2>
            <p className="text-muted-foreground">
              We do not warrant uninterrupted or error-free service. External links and third-party resources are not
              endorsed and are used at your own discretion.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">10. Termination</h2>
            <p className="text-muted-foreground">
              We may terminate or restrict access for breach of these Terms or applicable laws. You may stop using the
              platform at any time.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">11. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of
              courts in Mumbai, Maharashtra.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">12. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may update these Terms from time to time. Continued use of the platform after changes constitutes
              acceptance of the updated Terms.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">13. Contact</h2>
            <p className="text-muted-foreground">
              For questions regarding these Terms, contact us at <a href="mailto:contact.ranklao@gmail.com" className="text-primary">contact.ranklao@gmail.com</a> or visit our <a href="/contact" className="text-primary">Contact Us</a> page.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Terms;