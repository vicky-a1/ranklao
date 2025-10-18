import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img
              src="/images/logo.png"
              alt="Ranklao logo"
              className="w-8 h-8 rounded-lg object-contain"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Ranklao
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#exams" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Exams
            </a>
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#mentors" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              For Mentors
            </a>
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
          </div>
          
          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button 
              variant="ghost"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
            <Button 
              variant="default"
              onClick={() => navigate('/auth')}
            >
              Get Started
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6 text-foreground" />
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <a href="#exams" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Exams
              </a>
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#mentors" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                For Mentors
              </a>
              <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <div className="flex flex-col gap-2 pt-2">
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/auth');
                  }}
                >
                  Sign In
                </Button>
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/auth');
                  }}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
