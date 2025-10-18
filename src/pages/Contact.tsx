import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <BackButton className="mb-4" aria-label="Go back from Contact" />
          <h1 className="text-3xl font-bold">Contact Us – Ranklao</h1>
          <p className="mt-2 text-muted-foreground">
            We’re here to help you succeed. Whether you’re a student, mentor, or partner, our team is always
            ready to support you. Please reach out through the details below — we’ll respond within 24–48 hours.
          </p>

          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">Registered Office</h2>
            <div className="rounded-lg border p-4">
              <p>Neon Visuals (Sole Proprietorship)</p>
              <p>Room No. 20, Vishwakarma Rahiwashi Sangh,</p>
              <p>Jogeshwari–Vikhroli Link Road,</p>
              <p>Near Seepz Quarters, Andheri East,</p>
              <p>Mumbai, Maharashtra – 400093, India</p>
            </div>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">Contact Information</h2>
            <div className="rounded-lg border p-4 space-y-2">
              <p>
                Phone: <a href="tel:+919833450699" className="text-primary">+91 9833450699</a>
              </p>
              <p>
                Email: <a href="mailto:contact.ranklao@gmail.com" className="text-primary">contact.ranklao@gmail.com</a>
              </p>
              <p>Working Hours: Monday – Saturday, 10:00 AM – 6:00 PM (IST)</p>
            </div>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">Support &amp; General Queries</h2>
            <div className="rounded-lg border p-4 space-y-2">
              <p>
                For assistance regarding your Ranklao account, mentor/student onboarding, or app usage, please email us
                at:
              </p>
              <p>
                Email: <a href="mailto:contact.ranklao@gmail.com" className="text-primary">contact.ranklao@gmail.com</a>
              </p>
            </div>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">Partnership &amp; Collaboration</h2>
            <div className="rounded-lg border p-4 space-y-2">
              <p>Interested in partnering with Ranklao or Neon Visuals?</p>
              <p>
                Email: <a href="mailto:contact.ranklao@gmail.com" className="text-primary">contact.ranklao@gmail.com</a>
              </p>
            </div>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">Grievance &amp; Refund Queries</h2>
            <div className="rounded-lg border p-4 space-y-2">
              <p>
                If you face any issue regarding payments, refunds, or policy concerns, please write to:
              </p>
              <p>
                Email: <a href="mailto:contact.ranklao@gmail.com" className="text-primary">contact.ranklao@gmail.com</a>
              </p>
              <p className="text-muted-foreground">Our team will review and respond within 7 working days.</p>
            </div>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">Stay Connected</h2>
            <div className="rounded-lg border p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a href="https://instagram.com/ranklao" target="_blank" rel="noreferrer" className="text-primary">Instagram: @ranklao</a>
              <a href="https://linkedin.com/company/ranklao" target="_blank" rel="noreferrer" className="text-primary">LinkedIn: Ranklao</a>
              <a href="https://youtube.com/@ranklaoofficial" target="_blank" rel="noreferrer" className="text-primary">YouTube: Ranklao Official</a>
            </div>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">Location Map</h2>
            <div className="rounded-lg border overflow-hidden">
              <iframe
                src="https://www.google.com/maps?q=Andheri+East,+Mumbai&output=embed"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Andheri East, Mumbai"
              />
            </div>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">Response Policy</h2>
            <div className="rounded-lg border p-4 space-y-2">
              <p>
                We aim to respond to all messages within 24–48 business hours. In case of urgent concerns, please
                mention “URGENT” in your email subject line.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Contact;