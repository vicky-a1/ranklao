import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: string;
  className?: string;
}

const ProgressIndicator = ({ steps, currentStep, className }: ProgressIndicatorProps) => {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          return (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    {
                      "bg-green-500 border-green-500 text-white": isCompleted,
                      "bg-blue-500 border-blue-500 text-white": isCurrent,
                      "bg-gray-100 border-gray-300 text-gray-400": isUpcoming,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.icon || <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                
                {/* Step Label */}
                <div className="mt-2 text-center">
                  <div
                    className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      {
                        "text-green-600": isCompleted,
                        "text-blue-600": isCurrent,
                        "text-gray-400": isUpcoming,
                      }
                    )}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-xs text-gray-500 mt-1 max-w-20">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 transition-colors duration-300",
                    {
                      "bg-green-500": index < currentStepIndex,
                      "bg-gray-300": index >= currentStepIndex,
                    }
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;