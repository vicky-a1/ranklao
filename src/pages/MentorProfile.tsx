import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import { toast } from "@/hooks/use-toast";
import { 
  Star, 
  Calendar, 
  MessageCircle, 
  Video, 
  Heart, 
  Share2, 
  Award, 
  BookOpen, 
  Clock, 
  Users, 
  TrendingUp,
  GraduationCap,
  CheckCircle,
  ArrowLeft,
  Mail
} from "lucide-react";
import Navbar from "@/components/Navbar";

interface MentorProfile {
  id: string;
  user_id: string;
  air_rank: number;
  exam_type: string;
  exam_year: number;
  current_institution: string;
  specialization: string | null;
  bio: string | null;
  hourly_rate: number | null;
  average_rating: number | null;
  total_sessions: number | null;
  verification_status: string | null;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    email: string;
  } | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  student_profile: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
}

const MentorProfile = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");

  useEffect(() => {
    if (mentorId) {
      fetchMentorProfile();
      fetchReviews();
      fetchTimeSlots();
      checkFavoriteStatus();
    }
  }, [mentorId]);

  const fetchMentorProfile = async () => {
    if (!mentorId) return;
    
    try {
      // First, get the mentor profile
      const { data: mentorData, error: mentorError } = await supabase
        .from('mentor_profiles')
        .select('*')
        .eq('user_id', mentorId)
        .single();

      if (mentorError) throw mentorError;

      // Then, get the profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, email')
        .eq('id', mentorId)
        .single();

      if (profileError) throw profileError;

      // Combine the data
      const combinedData = {
        ...mentorData,
        profiles: profileData
      };

      setMentor(combinedData);
    } catch (error) {
      console.error('Error fetching mentor profile:', error);
      toast({
        title: "Error",
        description: "Failed to load mentor profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!mentorId) return;
    
    try {
      // First, get the reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('mentor_reviews')
        .select('*')
        .eq('mentor_id', mentorId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (reviewsError) throw reviewsError;

      if (reviewsData && reviewsData.length > 0) {
        // Get unique student IDs
        const studentIds = [...new Set(reviewsData.map(review => review.student_id))];
        
        // Fetch student profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', studentIds);

        if (profilesError) throw profilesError;

        // Combine the data
        const reviewsWithProfiles = reviewsData.map(review => ({
          ...review,
          student_profile: profilesData?.find(profile => profile.id === review.student_id) || {
            full_name: 'Unknown Student',
            avatar_url: null
          }
        }));

        setReviews(reviewsWithProfiles);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      // Generate sample time slots for the next 7 days
      const slots: TimeSlot[] = [];
      const today = new Date();
      
      for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
        times.forEach((time) => {
          slots.push({
            id: `${date.toISOString().split('T')[0]}-${time}`,
            date: date.toISOString().split('T')[0],
            time,
            available: Math.random() > 0.3 // 70% chance of being available
          });
        });
      }
      
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!user || !mentorId) return;
    
    try {
      const { data } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('mentor_id', mentorId)
        .single();

      if (data) setIsFavorite(true);
    } catch (error) {
      // Not a favorite
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add favorites",
        variant: "destructive",
      });
      return;
    }

    if (!mentorId) {
      toast({
        title: "Error",
        description: "Mentor ID not found",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFavorite) {
        await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('mentor_id', mentorId);
        setIsFavorite(false);
        toast({
          title: "Removed from favorites",
          description: "Mentor removed from your favorites",
        });
      } else {
        await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            mentor_id: mentorId
          });
        setIsFavorite(true);
        toast({
          title: "Added to favorites",
          description: "Mentor added to your favorites",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  const handleBookSession = () => {
    navigate(`/book-session/${mentorId}`);
  };

  const handleMessage = () => {
    navigate(`/messages/${mentorId}`);
  };

  const handleVideoCall = () => {
    // Implement video call functionality
    toast({
      title: "Video Call",
      description: "Video call feature coming soon!",
    });
  };

  const renderStars = (rating: number | null) => {
    const ratingValue = rating || 0;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < ratingValue ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="text-center">Loading mentor profile...</div>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Mentor not found</h2>
            <Button onClick={() => navigate('/browse-mentors')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Browse Mentors
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/browse-mentors')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Browse Mentors
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Mentor Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={mentor.profiles?.avatar_url || ''} />
                      <AvatarFallback className="text-2xl">
                        {mentor.profiles?.full_name?.charAt(0) || 'M'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold mb-2">{mentor.profiles?.full_name}</h1>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            AIR {mentor.air_rank} • {mentor.exam_type} {mentor.exam_year}
                          </Badge>
                          {mentor.verification_status === 'approved' && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <GraduationCap className="w-4 h-4" />
                            {mentor.current_institution}
                          </div>
                          {mentor.specialization && (
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {mentor.specialization}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            {renderStars(mentor.average_rating)}
                            <span className="text-sm font-medium ml-1">
                              {mentor.average_rating?.toFixed(1) || '0.0'} ({reviews.length} reviews)
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            {mentor.total_sessions || 0} sessions completed
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleFavorite}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {mentor.bio && (
                      <p className="text-muted-foreground leading-relaxed">{mentor.bio}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {mentor.profiles?.full_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Academic Background</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Exam:</span>
                            <span>{mentor.exam_type} {mentor.exam_year}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">AIR Rank:</span>
                            <span className="font-medium">{mentor.air_rank}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Institution:</span>
                            <span>{mentor.current_institution}</span>
                          </div>
                          {mentor.specialization && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Specialization:</span>
                              <span>{mentor.specialization}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3">Mentoring Stats</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Sessions:</span>
                            <span>{mentor.total_sessions || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Average Rating:</span>
                            <span>{mentor.average_rating?.toFixed(1) || '0.0'}/5.0</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Response Time:</span>
                            <span>Within 2 hours</span>
                          </div>
                          {mentor.hourly_rate && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Hourly Rate:</span>
                              <span className="font-medium">₹{mentor.hourly_rate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Expertise Areas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Exam Strategy</Badge>
                      <Badge variant="outline">Time Management</Badge>
                      <Badge variant="outline">Subject Guidance</Badge>
                      <Badge variant="outline">Mock Tests</Badge>
                      <Badge variant="outline">Career Counseling</Badge>
                      <Badge variant="outline">Motivation</Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={review.student_profile?.avatar_url || ''} />
                            <AvatarFallback>
                              {review.student_profile?.full_name?.charAt(0) || 'S'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{review.student_profile?.full_name}</h4>
                              <div className="flex items-center gap-1">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">No reviews yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Time Slots</CardTitle>
                    <CardDescription>Book a session with {mentor.profiles?.full_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {timeSlots.filter(slot => slot.available).slice(0, 12).map((slot) => (
                        <Button
                          key={slot.id}
                          variant="outline"
                          className="h-auto p-3 flex flex-col items-start"
                          onClick={() => handleBookSession()}
                        >
                          <div className="text-sm font-medium">
                            {new Date(slot.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground">{slot.time}</div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Achievements & Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <Award className="w-8 h-8 text-yellow-600" />
                        <div>
                          <h4 className="font-medium">Top Ranker - {mentor.exam_type} {mentor.exam_year}</h4>
                          <p className="text-sm text-muted-foreground">AIR {mentor.air_rank}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <TrendingUp className="w-8 h-8 text-blue-600" />
                        <div>
                          <h4 className="font-medium">Excellent Mentor Rating</h4>
                          <p className="text-sm text-muted-foreground">{mentor.average_rating?.toFixed(1) || '0.0'}/5.0 from {reviews.length} reviews</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <div>
                          <h4 className="font-medium">Verified Profile</h4>
                          <p className="text-sm text-muted-foreground">Identity and credentials verified</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Booking Card */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Book a Session</span>
                  {mentor.hourly_rate && (
                    <span className="text-2xl font-bold">₹{mentor.hourly_rate}/hr</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleBookSession}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Session
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleMessage}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleVideoCall}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Video Call
                  </Button>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Usually responds within 2 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>100% verified profile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{mentor.total_sessions || 0} successful sessions</span>
                  </div>
                </div>

                <Separator />

                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">Contact Information</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="w-3 h-3" />
                      <span className="text-muted-foreground">Available via platform</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorProfile;