import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <BackButton className="mb-4" aria-label="Go back from Privacy Policy" />
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="mt-2 text-muted-foreground">
            This Privacy Policy explains how Ranklao collects, uses, and protects your information. We respect your privacy and
            process data in accordance with applicable laws and best practices.
          </p>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information you provide (such as name, email, and profile details) and usage data (including device information, IP address,
              and interaction logs). Payment-related information is processed securely by our payment gateway providers.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use data to provide services, personalize experiences, improve platform performance, enable secure payments, prevent fraud, and
              communicate important updates. We may also use anonymized data for analytics.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">3. Cookies and Tracking</h2>
            <p className="text-muted-foreground">
              We use cookies and similar technologies to maintain sessions, remember preferences, and analyze usage. You can manage cookies via browser
              settings; disabling some cookies may affect functionality.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">4. Data Sharing and Third Parties</h2>
            <p className="text-muted-foreground">
              We may share data with service providers (e.g., hosting, analytics, payment gateways) strictly for platform operation. We do not sell
              personal data. Third-party services are governed by their own privacy policies.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">5. Security</h2>
            <p className="text-muted-foreground">
              We implement technical and organizational measures to protect your information. While no system is completely secure, we strive to
              safeguard data against unauthorized access, alteration, or disclosure.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">6. Your Rights</h2>
            <p className="text-muted-foreground">
              You may request access, correction, or deletion of your data as permitted by law. To exercise these rights, contact us using the details
              provided below.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">7. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain information for as long as necessary to provide services, meet legal obligations, and resolve disputes. Retention periods may
              vary depending on the type of data and applicable regulations.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">8. Children’s Privacy</h2>
            <p className="text-muted-foreground">
              Our services are intended for users who meet the minimum age requirements. We do not knowingly collect personal data from children without
              parental consent and supervision.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">9. Updates to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. Continued use of the platform after changes indicates acceptance of the updated policy.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">10. Contact</h2>
            <p className="text-muted-foreground">
              For privacy-related queries, contact us at <a href="mailto:contact.ranklao@gmail.com" className="text-primary">contact.ranklao@gmail.com</a> or visit our <Link to="/contact" className="text-primary">Contact Us</Link> page.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;