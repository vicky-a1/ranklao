import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <BackButton className="mb-4" aria-label="Go back from About" />
          <h1 className="text-3xl font-bold">About Ranklao</h1>
          <p className="mt-2 text-muted-foreground">
            Ranklao connects aspirants with proven rankers for mentorship, curated resources, and structured preparation across competitive exams.
          </p>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">Our Mission</h2>
            <p className="text-muted-foreground">
              To democratize access to high-quality guidance by partnering learners with mentors who have achieved top ranks and have a passion for teaching.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">What We Offer</h2>
            <p className="text-muted-foreground">
              1:1 mentorship, study plans, mock tests, and community support tailored for exams like JEE, NEET, and CA Foundation.
            </p>
          </section>

          <section className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">Contact</h2>
            <p className="text-muted-foreground">
              Questions? Visit our <a href="/contact" className="text-primary">Contact Us</a> page or email <a href="mailto:contact.ranklao@gmail.com" className="text-primary">contact.ranklao@gmail.com</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default About;