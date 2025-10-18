// Logo updated to use external image
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
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
            <p className="text-sm text-muted-foreground">
              Rankers who've proven it, now guiding you.
            </p>
          </div>
          
          {/* Exams */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Exams</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li 
                className="hover:text-primary cursor-pointer transition-colors"
                onClick={() => document.getElementById('exams')?.scrollIntoView({ behavior: 'smooth' })}
              >
                JEE Preparation
              </li>
              <li 
                className="hover:text-primary cursor-pointer transition-colors"
                onClick={() => document.getElementById('exams')?.scrollIntoView({ behavior: 'smooth' })}
              >
                NEET Preparation
              </li>
              <li 
                className="hover:text-primary cursor-pointer transition-colors"
                onClick={() => document.getElementById('exams')?.scrollIntoView({ behavior: 'smooth' })}
              >
                CA Foundation
              </li>
              <li className="hover:text-primary cursor-pointer transition-colors">Coming Soon</li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li 
                className="hover:text-primary cursor-pointer transition-colors"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Study Materials
              </li>
              <li 
                className="hover:text-primary cursor-pointer transition-colors"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Mock Tests
              </li>
              <li className="hover:text-primary cursor-pointer transition-colors">Success Stories</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Blog</li>
              <li>
                <Link to="/refund-cancellation" className="hover:text-primary transition-colors">Refund & Cancellation</Link>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
              </li>
              <li 
                className="hover:text-primary cursor-pointer transition-colors"
                onClick={() => document.getElementById('mentors')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Become a Mentor
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Ranklao. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <a href="#" className="hover:text-primary transition-colors">Cookies</a>
            <Link to="/refund-cancellation" className="hover:text-primary transition-colors">Refund & Cancellation</Link>
            <Link to="/pricing-policy" className="hover:text-primary transition-colors">Pricing Policy</Link>
            <Link to="/shipping-policy" className="hover:text-primary transition-colors">Shipping Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
