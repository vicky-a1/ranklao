import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Arjun Sharma",
    exam: "JEE Advanced 2024",
    rank: "AIR 147",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
    text: "Ranklao's mentorship program was a game-changer. The personalized guidance from my top-ranked mentor helped me crack JEE with a top rank!",
    rating: 5,
  },
  {
    name: "Priya Patel",
    exam: "NEET 2024",
    rank: "AIR 89",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    text: "The study materials and weekly sessions were incredibly helpful. My mentor's strategies made complex topics easy to understand.",
    rating: 5,
  },
  {
    name: "Rahul Verma",
    exam: "JEE Main 2024",
    rank: "99.8 percentile",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
    text: "Best investment I made for my preparation. The doubt-solving sessions and mock test analysis were spot on.",
    rating: 5,
  },
  {
    name: "Sneha Reddy",
    exam: "JEE Advanced 2024",
    rank: "AIR 324",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
    text: "The 24x7 support and personalized attention made all the difference. Highly recommend the Premium Plus plan!",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-muted/30 via-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Success{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Stories
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Hear from our students who achieved their dreams with Ranklao
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-border/50 bg-card/80 backdrop-blur animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-primary/20 mb-4" />
                
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full ring-2 ring-primary/20"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-xs text-muted-foreground">{testimonial.exam}</p>
                  </div>
                </div>

                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                  ))}
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  {testimonial.text}
                </p>

                <div className="inline-block bg-gradient-to-r from-primary/10 to-secondary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                  {testimonial.rank}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
