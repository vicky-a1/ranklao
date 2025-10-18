import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  fallback?: string;
  className?: string;
  label?: string;
}

const BackButton = ({ fallback = "/", className = "", label = "Back" }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    // If we have history entries, go back to preserve state; otherwise, use fallback.
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    // If referrer exists and same-origin, try going back; else navigate to fallback route
    try {
      const ref = document.referrer;
      const sameOrigin = ref && new URL(ref).origin === window.location.origin;
      if (sameOrigin) {
        navigate(-1);
        return;
      }
    } catch (e) {
      // Ignore URL parsing failures; just use fallback
    }

    navigate(fallback);
  };

  return (
    <div className={`mb-4 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBack}
        aria-label="Go back"
        title="Go back"
        className="inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        <span>{label}</span>
      </Button>
    </div>
  );
};

export default BackButton;