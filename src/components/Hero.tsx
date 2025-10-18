import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const campusImages = [
    "/images/iit-delhi-campus.jpg",
    "/images/iit-madras-campus.jpg",
    "/images/iit-bombay-campus.jpg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % campusImages.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* IIT Campus Background Slideshow */}
      <div className="absolute inset-0">
        {campusImages.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img 
              src={image} 
              alt={`IIT Campus ${index + 1}`} 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {/* Overlay for authenticity and readability */}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
          {/* Brand Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
            <img
              src="/images/badge.png"
              alt=""
              aria-hidden="true"
              className="w-3.5 h-3.5 object-contain"
            />
            <span className="text-xs font-medium text-primary">Rankers who've proven it, now guiding you</span>
          </div>
          
          {/* App Name */}
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Ranklao
            </span>
          </h1>
          
          {/* Tagline */}
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Connect with proven rankers who've cracked JEE, NEET, and CA. 
            Get their winning strategies, curated resources, and personalized mentorship to achieve your dream rank.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button 
              variant="hero" 
              size="lg" 
              className="group"
              onClick={() => navigate('/auth')}
            >
              Start Your Journey
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-background/50 backdrop-blur-sm"
              onClick={() => navigate('/auth')}
            >
              I'm a Ranker
            </Button>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Hero;
