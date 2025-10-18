import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  Calendar,
  Clock,
  Target,
  Activity,
  Star,
  Loader2,
  Download
} from "lucide-react";
import BackButton from "@/components/BackButton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

interface Session {
  id: string;
  scheduled_at: string;
  status: string;
  rating?: number;
  mentor_id: string;
  student_id: string;
  session_ratings?: Array<{ rating: number }>;
  duration_minutes: number;
  session_notes?: Array<{ note_type: string }>;
}

interface SessionStats {
  total_sessions: number;
  completed_sessions: number;
  total_hours: number;
  average_rating: number;
  subjects_covered: string[];
  monthly_progress: Array<{
    month: string;
    sessions: number;
    hours: number;
    rating: number;
  }>;
}

interface PerformanceMetrics {
  improvement_rate: number;
  consistency_score: number;
  engagement_level: number;
  goal_completion: number;
}

interface StudyGoal {
  id: string;
  title: string;
  description: string;
  target_date: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
}

interface RecentActivity {
  id: string;
  type: 'session' | 'goal' | 'achievement';
  title: string;
  description: string;
  date: string;
  icon: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ProgressTracking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [studyGoals, setStudyGoals] = useState<StudyGoal[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [selectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchProgressData();
  }, [user, navigate, selectedTimeframe]);

  const fetchProgressData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch session statistics
      const { data: sessions, error: sessionsError } = await supabase
        .from("sessions")
        .select(`
          *,
          session_ratings (rating),
          session_notes (note_type)
        `)
        .eq("student_id", user.id)
        .order("scheduled_at", { ascending: false });

      if (sessionsError) throw sessionsError;

      // Calculate session stats
      const totalSessions = sessions?.length || 0;
      const completedSessions = sessions?.filter(s => s.status === 'completed').length || 0;
      const totalHours = sessions?.reduce((acc, s) => acc + (s.duration_minutes / 60), 0) || 0;
      const ratings = sessions?.flatMap(s => 
        Array.isArray(s.session_ratings) ? s.session_ratings.map((r: any) => r.rating) : []
      ) || [];
      const averageRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;

      // Get subjects from session notes
      const subjects = [...new Set(
        sessions?.flatMap(s => 
          Array.isArray(s.session_notes) ? s.session_notes.map((n: any) => n.note_type) : []
        ) || []
      )];

      // Calculate monthly progress
      const monthlyData = calculateMonthlyProgress((sessions || []) as unknown as Session[]);

      setSessionStats({
        total_sessions: totalSessions,
        completed_sessions: completedSessions,
        total_hours: totalHours,
        average_rating: averageRating,
        subjects_covered: subjects,
        monthly_progress: monthlyData
      });

      // Calculate performance metrics
      const improvementRate = calculateImprovementRate((sessions || []) as unknown as Session[]);
      const consistencyScore = calculateConsistencyScore((sessions || []) as unknown as Session[]);
      const engagementLevel = calculateEngagementLevel((sessions || []) as unknown as Session[]);

      setPerformanceMetrics({
        improvement_rate: improvementRate,
        consistency_score: consistencyScore,
        engagement_level: engagementLevel,
        goal_completion: 75 // Mock data for now
      });

      // Mock study goals and recent activity
      setStudyGoals([
        {
          id: '1',
          title: 'Complete 20 Math Sessions',
          description: 'Focus on algebra and calculus concepts',
          target_date: '2024-12-31',
          progress: 65,
          status: 'active',
          created_at: '2024-01-01'
        },
        {
          id: '2',
          title: 'Improve Physics Understanding',
          description: 'Master mechanics and thermodynamics',
          target_date: '2024-11-30',
          progress: 40,
          status: 'active',
          created_at: '2024-02-01'
        }
      ]);

      setRecentActivity([
        {
          id: '1',
          type: 'session',
          title: 'Completed Math Session',
          description: 'Worked on quadratic equations',
          date: new Date().toISOString(),
          icon: '📚'
        },
        {
          id: '2',
          type: 'achievement',
          title: 'Consistency Streak!',
          description: '7 days of regular study',
          date: new Date(Date.now() - 86400000).toISOString(),
          icon: '🔥'
        }
      ]);

    } catch (error) {
      console.error("Error fetching progress data:", error);
      toast({ title: "Error", description: "Failed to load progress data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyProgress = (sessions: Session[]) => {
    const monthlyMap = new Map();
    
    sessions.forEach(session => {
      const date = new Date(session.scheduled_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { sessions: 0, hours: 0, ratings: [] });
      }
      
      const data = monthlyMap.get(monthKey);
      data.sessions += 1;
      data.hours += session.duration_minutes / 60;
      
      if (session.session_ratings?.length && session.session_ratings.length > 0) {
        data.ratings.push(...session.session_ratings.map(r => r.rating));
      }
    });

    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        sessions: data.sessions,
        hours: Math.round(data.hours * 10) / 10,
        rating: data.ratings.length > 0 ? 
          Math.round((data.ratings.reduce((a: number, b: number) => a + b, 0) / data.ratings.length) * 10) / 10 : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  };

  const calculateImprovementRate = (sessions: Session[]) => {
    if (sessions.length < 2) return 0;
    
    const ratings = sessions
      .filter(s => s.session_ratings?.length && s.session_ratings.length > 0)
      .map(s => ({
        date: new Date(s.scheduled_at),
        rating: s.session_ratings![0].rating
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (ratings.length < 2) return 0;

    const firstRating = ratings[0].rating;
    const lastRating = ratings[ratings.length - 1].rating;
    
    return Math.round(((lastRating - firstRating) / firstRating) * 100);
  };

  const calculateConsistencyScore = (sessions: Session[]) => {
    if (sessions.length === 0) return 0;
    
    const last30Days = sessions.filter(s => {
      const sessionDate = new Date(s.scheduled_at);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return sessionDate >= thirtyDaysAgo;
    });

    return Math.min(100, Math.round((last30Days.length / 30) * 100 * 4)); // Assuming ideal is ~7-8 sessions per month
  };

  const calculateEngagementLevel = (sessions: Session[]) => {
    if (sessions.length === 0) return 0;
    
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const engagementRate = (completedSessions / sessions.length) * 100;
    
    return Math.round(engagementRate);
  };

  const exportProgress = () => {
    const data = {
      sessionStats,
      performanceMetrics,
      studyGoals,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progress-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Success", description: "Progress report exported successfully!" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="relative z-10 border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <BackButton className="mb-4" />
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Progress Tracking & Analytics</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportProgress}>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-premium border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                      <p className="text-2xl font-bold">{sessionStats?.total_sessions || 0}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-premium border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Study Hours</p>
                      <p className="text-2xl font-bold">{sessionStats?.total_hours.toFixed(1) || 0}</p>
                    </div>
                    <Clock className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-premium border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                      <p className="text-2xl font-bold">{sessionStats?.average_rating.toFixed(1) || 0}</p>
                    </div>
                    <Star className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-premium border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                      <p className="text-2xl font-bold">
                        {sessionStats?.total_sessions ? 
                          Math.round((sessionStats.completed_sessions / sessionStats.total_sessions) * 100) : 0}%
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Chart */}
            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Monthly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sessionStats?.monthly_progress || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sessions" stroke="#8884d8" name="Sessions" />
                    <Line type="monotone" dataKey="hours" stroke="#82ca9d" name="Hours" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <span className="text-2xl">{activity.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-premium border-border/50">
                <CardHeader>
                  <CardTitle>Improvement Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Progress value={Math.max(0, performanceMetrics?.improvement_rate || 0)} className="h-3" />
                    </div>
                    <span className="text-lg font-bold">
                      {performanceMetrics?.improvement_rate || 0}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Based on session ratings over time
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-premium border-border/50">
                <CardHeader>
                  <CardTitle>Consistency Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Progress value={performanceMetrics?.consistency_score || 0} className="h-3" />
                    </div>
                    <span className="text-lg font-bold">
                      {performanceMetrics?.consistency_score || 0}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Regular study schedule adherence
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-premium border-border/50">
                <CardHeader>
                  <CardTitle>Engagement Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Progress value={performanceMetrics?.engagement_level || 0} className="h-3" />
                    </div>
                    <span className="text-lg font-bold">
                      {performanceMetrics?.engagement_level || 0}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Session completion and participation
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-premium border-border/50">
                <CardHeader>
                  <CardTitle>Goal Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Progress value={performanceMetrics?.goal_completion || 0} className="h-3" />
                    </div>
                    <span className="text-lg font-bold">
                      {performanceMetrics?.goal_completion || 0}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Study goals achieved on time
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            {/* Study Goals */}
            <div className="grid gap-6">
              {studyGoals.map((goal) => (
                <Card key={goal.id} className="shadow-premium border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        {goal.title}
                      </CardTitle>
                      <Badge variant={goal.status === 'active' ? 'default' : 'secondary'}>
                        {goal.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{goal.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                    <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                      <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                      <span>Created: {new Date(goal.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Detailed Analytics */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="shadow-premium border-border/50">
                <CardHeader>
                  <CardTitle>Session Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sessionStats?.monthly_progress || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sessions" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-premium border-border/50">
                <CardHeader>
                  <CardTitle>Subject Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sessionStats?.subjects_covered.map((subject, index) => (
                      <div key={subject} className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="capitalize">{subject}</span>
                      </div>
                    )) || <p className="text-muted-foreground">No subjects data available</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}