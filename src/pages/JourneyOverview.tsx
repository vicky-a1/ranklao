import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CreditCard, 
  User, 
  Search, 
  UserCheck, 
  FileText, 
  MessageCircle,
  ArrowRight,
  CheckCircle,
  Star,
  Clock,
  Target,
  BookOpen,
  Award,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const JourneyOverview = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'Basic';
  const amount = searchParams.get('amount') || '999';

  const journeySteps = [
    {
      id: 1,
      icon: CreditCard,
      title: "Secure Payment",
      description: "Complete your payment securely with Razorpay",
      details: [
        "100% secure payment gateway",
        "Multiple payment options",
        "Instant confirmation"
      ],
      color: "bg-green-500"
    },
    {
      id: 2,
      icon: User,
      title: "Profile Setup",
      description: "Tell us about your goals and preferences",
      details: [
        "Academic background & goals",
        "Exam preparation focus",
        "Learning preferences",
        "Availability schedule"
      ],
      color: "bg-blue-500"
    },
    {
      id: 3,
      icon: Search,
      title: "Browse Mentors",
      description: "Discover top-ranked mentors matched to your needs",
      details: [
        "AI-powered mentor matching",
        "Filter by rank, exam, specialization",
        "View detailed mentor profiles",
        "Read reviews and ratings"
      ],
      color: "bg-purple-500"
    },
    {
      id: 4,
      icon: UserCheck,
      title: "Choose Your Mentor",
      description: "Select the perfect mentor for your journey",
      details: [
        "Book 1-on-1 sessions",
        "Flexible scheduling",
        "Direct communication",
        "Personalized guidance"
      ],
      color: "bg-orange-500"
    },
    {
      id: 5,
      icon: FileText,
      title: "Access Personalized Notes",
      description: "Get exclusive study materials and resources",
      details: [
        "Mentor's personal notes",
        "Exam-specific strategies",
        "Previous year insights",
        "Study schedules & tips"
      ],
      color: "bg-indigo-500"
    },
    {
      id: 6,
      icon: MessageCircle,
      title: "Ongoing Guidance",
      description: "Continuous support throughout your preparation",
      details: [
        "Regular progress tracking",
        "Doubt resolution sessions",
        "Mock test analysis",
        "Motivation & mentorship"
      ],
      color: "bg-pink-500"
    }
  ];

  const benefits = [
    {
      icon: Star,
      title: "Top 1% Mentors",
      description: "Learn from IIT/NIT toppers and industry experts"
    },
    {
      icon: Target,
      title: "Personalized Approach",
      description: "Customized study plans based on your strengths"
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Book sessions at your convenience"
    },
    {
      icon: BookOpen,
      title: "Exclusive Resources",
      description: "Access to mentor's personal notes and strategies"
    },
    {
      icon: Award,
      title: "Proven Results",
      description: "95% of our students improve their ranks"
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Join a community of ambitious learners"
    }
  ];

  const handleProceedToPayment = () => {
    navigate(`/?plan=${plan}&amount=${amount}&checkout=true`);
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Learning Journey</h1>
              <p className="text-gray-600">See what happens after you join us</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Selected Plan</p>
              <p className="text-xl font-bold text-blue-600">{plan} - ₹{amount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Journey Steps */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Complete Journey</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From payment to success - here's exactly what you'll experience as our student
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journeySteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <Card key={step.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`${step.color} p-3 rounded-lg text-white flex-shrink-0`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                            Step {step.id}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                        <ul className="space-y-1">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-center text-sm text-gray-500">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {index < journeySteps.length - 1 && (
                      <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 hidden lg:block">
                        <ArrowRight className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-lg text-gray-600">
              Join thousands of successful students who achieved their dreams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>



        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Journey?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of successful students and get personalized mentorship from top rankers
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleGoBack}
              variant="outline"
              size="lg"
              className="px-8"
            >
              Go Back
            </Button>
            <Button
              onClick={handleProceedToPayment}
              size="lg"
              className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Proceed to Payment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              30-day money back guarantee
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              Secure payment
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              Instant access
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyOverview;