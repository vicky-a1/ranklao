import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Star, Calendar, Award, BookOpen, MessageCircle, Sparkles, Filter, Users, Search, SlidersHorizontal, MapPin, Clock, Video, Heart, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";

import { useAuth } from "@/contexts/AuthContext";

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
  average_rating: number;
  total_sessions: number;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  } | null;
}

export default function BrowseMentors() {
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [examFilter, setExamFilter] = useState("all");
  const [institutionFilter, setInstitutionFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState([0]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const plan = searchParams.get("plan");
  const isNewUser = searchParams.get("new_user") === "true";

  useEffect(() => {
    fetchMentors();
    if (user && isNewUser) {
      fetchUserProfile();
      showWelcomeMessage();
    }
    if (user) {
      fetchFavorites();
    }
  }, [user, isNewUser]);

  useEffect(() => {
    applyFilters();
  }, [mentors, searchQuery, examFilter, institutionFilter, ratingFilter, priceRange, sortBy]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const showWelcomeMessage = () => {
    toast({
      title: "🎉 Welcome to Ranklao!",
      description: `Your ${plan || "Premium"} plan is active. Let's find you the perfect mentor!`,
      duration: 5000,
    });
  };

  const fetchMentors = async () => {
    try {
      // Use cached queries for better performance
      const result = await import('@/utils/cachedQueries')
        .then(module => module.cachedQueries.getVerifiedMentors());

      if (result.error) throw result.error;
      setMentors(result.data || []);
    } catch (error) {
      console.error("Error fetching mentors:", error);
      toast({
        title: "Error",
        description: "Failed to load mentors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('mentor_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setFavorites(data?.map(fav => fav.mentor_id) || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const toggleFavorite = async (mentorId: string) => {
    if (!user) return;
    
    try {
      const isFavorite = favorites.includes(mentorId);
      
      if (isFavorite) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('mentor_id', mentorId);
        
        if (error) throw error;
        setFavorites(prev => prev.filter(id => id !== mentorId));
        toast({ title: "Removed from favorites" });
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert({ user_id: user.id, mentor_id: mentorId });
        
        if (error) throw error;
        setFavorites(prev => [...prev, mentorId]);
        toast({ title: "Added to favorites" });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  const applyFilters = () => {
    let filtered = [...mentors];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(mentor =>
        mentor.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.current_institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Exam filter
    if (examFilter !== "all") {
      filtered = filtered.filter(mentor => mentor.exam_type === examFilter);
    }

    // Institution filter
    if (institutionFilter !== "all") {
      filtered = filtered.filter(mentor => mentor.current_institution === institutionFilter);
    }

    // Rating filter
    if (ratingFilter[0] > 0) {
      filtered = filtered.filter(mentor => mentor.average_rating >= ratingFilter[0]);
    }

    // Price range filter
    filtered = filtered.filter(mentor => {
      const rate = mentor.hourly_rate || 0;
      return rate >= priceRange[0] && rate <= priceRange[1];
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.average_rating - a.average_rating;
        case "price_low":
          return (a.hourly_rate || 0) - (b.hourly_rate || 0);
        case "price_high":
          return (b.hourly_rate || 0) - (a.hourly_rate || 0);
        case "rank":
          return a.air_rank - b.air_rank;
        case "sessions":
          return b.total_sessions - a.total_sessions;
        default:
          return 0;
      }
    });

    setFilteredMentors(filtered);
  };

  const getUniqueExams = () => {
    return [...new Set(mentors.map(mentor => mentor.exam_type))];
  };

  const getUniqueInstitutions = () => {
    return [...new Set(mentors.map(mentor => mentor.current_institution))];
  };

  const handleBookSession = (mentorId: string) => {
    navigate(`/book-session/${mentorId}`);
  };

  const handleViewProfile = (mentorId: string) => {
    navigate(`/mentor-profile/${mentorId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="text-center">Loading mentors...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <BackButton className="mb-6" aria-label="Go back from Browse Mentors" />
        {isNewUser && plan && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Welcome to Your {plan}!</h2>
                <p className="text-gray-600">Your payment was successful. Let's find you the perfect mentor!</p>
              </div>
            </div>
            {userProfile && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-sm">Your Goals</span>
                  </div>
                  <p className="text-sm text-gray-600">{userProfile.goals || "Career growth"}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-sm">Experience Level</span>
                  </div>
                  <p className="text-sm text-gray-600 capitalize">{userProfile.experience_level || "Beginner"}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center gap-2 mb-2">
                    <Filter className="w-4 h-4 text-purple-500" />
                    <span className="font-medium text-sm">Interests</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {userProfile.interests?.slice(0, 2).join(", ") || "Multiple areas"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {isNewUser ? "Recommended" : "Browse"} <span className="text-primary">Top Mentors</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            {isNewUser 
              ? "Based on your profile, here are mentors perfect for your journey"
              : "Connect with verified top rankers and get personalized guidance"
            }
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search mentors by name, institution, or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="rank">Best Rank</SelectItem>
                  <SelectItem value="sessions">Most Sessions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Exam Type</label>
                <Select value={examFilter} onValueChange={setExamFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Exams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Exams</SelectItem>
                    {getUniqueExams().map(exam => (
                      <SelectItem key={exam} value={exam}>{exam}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Institution</label>
                <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Institutions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Institutions</SelectItem>
                    {getUniqueInstitutions().map(institution => (
                      <SelectItem key={institution} value={institution}>{institution}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Minimum Rating: {ratingFilter[0]}⭐
                </label>
                <Slider
                  value={ratingFilter}
                  onValueChange={setRatingFilter}
                  max={5}
                  min={0}
                  step={0.5}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={5000}
                  min={0}
                  step={100}
                  className="mt-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Showing {filteredMentors.length} of {mentors.length} mentors
          </p>
          {searchQuery && (
            <Button
              variant="ghost"
              onClick={() => setSearchQuery("")}
              className="text-sm"
            >
              Clear search
            </Button>
          )}
        </div>

        {/* Mentor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <Card key={mentor.id} className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="relative">
                <div className="absolute top-4 right-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(mentor.user_id)}
                    className="h-8 w-8 p-0"
                  >
                    <Heart 
                      className={`w-4 h-4 ${
                        favorites.includes(mentor.user_id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-gray-400'
                      }`} 
                    />
                  </Button>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {mentor.profiles?.full_name || "Mentor"}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        AIR {mentor.air_rank}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {mentor.exam_type} {mentor.exam_year}
                      </span>
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{mentor.average_rating}</span>
                    <span className="text-muted-foreground">
                      ({mentor.total_sessions} sessions)
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Available
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium">{mentor.current_institution}</span>
                  </div>
                  {mentor.specialization && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      <span>{mentor.specialization}</span>
                    </div>
                  )}
                </div>

                {mentor.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {mentor.bio}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      ₹{mentor.hourly_rate || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">per session</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewProfile(mentor.user_id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleBookSession(mentor.user_id)}
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      Book
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/messages/${mentor.user_id}`)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Video Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMentors.length === 0 && mentors.length > 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No mentors found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setExamFilter("all");
                setInstitutionFilter("all");
                setRatingFilter([0]);
                setPriceRange([0, 5000]);
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}

        {mentors.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No mentors available</h3>
            <p className="text-muted-foreground">
              No verified mentors available at the moment. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
