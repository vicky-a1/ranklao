import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { Link } from "react-router-dom";

const FAQ = () => {
  const faqs = [
    {
      q: "What is Ranklao?",
      a: "Ranklao connects aspirants with proven rankers for mentorship, curated resources, and structured preparation across exams like JEE, NEET, and CA.",
    },
    {
      q: "How do I book a mentor session?",
      a: "Browse verified mentors, select a profile, and use the booking flow to schedule a session. You’ll receive confirmations and reminders via email.",
    },
    {
      q: "Are mentors verified?",
      a: "Yes. We verify mentor credentials, ranks, and backgrounds during onboarding, and continue to monitor performance and feedback.",
    },
    {
      q: "How are payments handled?",
      a: "Payments are processed via secure gateways. For failed payments or refund-related queries, please refer to our Refund & Cancellation policy.",
    },
    {
      q: "What is your refund policy?",
      a: "Approved refunds are processed within typical banking timelines. See the Refund & Cancellation page for eligibility, timeframes, and the request process.",
    },
    {
      q: "How is my data used?",
      a: "We collect and process data to operate and improve the platform, as detailed in our Privacy Policy. You can request data access or deletion per policy provisions.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <BackButton className="mb-4" aria-label="Go back from FAQs" />
          <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
          <p className="mt-2 text-muted-foreground">
            Quick answers to common questions about Ranklao, mentor sessions, payments, and policies.
          </p>

          <div className="mt-8 space-y-4">
            {faqs.map((item, idx) => (
              <div key={idx} className="rounded-lg border p-4">
                <h2 className="text-lg font-semibold">{item.q}</h2>
                <p className="mt-1 text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-lg border p-4 text-sm text-muted-foreground">
            Can’t find your answer? Email <a href="mailto:contact.ranklao@gmail.com" className="text-primary">contact.ranklao@gmail.com</a> or visit our <Link to="/contact" className="text-primary">Contact Us</Link> page.
          </div>
        </div>
      </main>
    </div>
  );
};

export default FAQ;