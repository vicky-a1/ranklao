import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";

const authSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }).optional(),
});

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/onboarding");
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/onboarding");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      console.log('Attempting Google OAuth with Supabase...');
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Redirect URL:', `${window.location.origin}/onboarding`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false
        }
      });
      
      console.log('OAuth response data:', data);
      console.log('OAuth response error:', error);
      
      if (error) {
        console.error('Google OAuth error details:', {
          message: error.message,
          status: error.status,
          details: error
        });
        
        // Check for specific error types
        if (error.message?.includes('provider is not enabled') || error.message?.includes('validation_failed')) {
          toast({
            title: "Google Sign In Configuration Issue",
            description: "Google OAuth provider is not properly configured in Supabase. Please use email/password authentication for now.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Google Sign In Failed",
            description: error.message || "Failed to sign in with Google. Please try again or use email/password.",
            variant: "destructive",
          });
        }
      } else {
        console.log('Google OAuth initiated successfully');
      }
    } catch (error: unknown) {
      console.error('Google sign in catch error:', error);
      toast({
        title: "Error",
        description: `Failed to sign in with Google: ${(error as Error)?.message || 'Unknown error'}. Please try email/password authentication.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      authSchema.parse({
        email: formData.email,
        password: formData.password,
        fullName: isLogin ? undefined : formData.fullName,
      });

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Login Failed",
              description: "Invalid email or password. Please check your credentials.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome Back!",
            description: "You've successfully logged in.",
          });
        }
      } else {
        const redirectUrl = `${window.location.origin}/onboarding`;
        
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: formData.fullName,
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account Exists",
              description: "This email is already registered. Please log in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          try {
            await supabase.functions.invoke("send-account-verification", {
              body: {
                email: formData.email,
                fullName: formData.fullName,
              },
            });
          } catch (emailErr) {
            console.error("Verification email error:", emailErr);
          }
          toast({
            title: "Account Created!",
            description: "We sent a verification email. Then continue to onboarding.",
          });
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="w-full max-w-md relative z-10">
        <BackButton fallback="/" className="mb-6" aria-label="Go back from Auth" label="Back to Home" />

        <Card className="shadow-premium border-border/50">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <img
                src="/images/logo.png"
                alt="Ranklao logo"
                className="w-10 h-10 rounded-lg object-contain"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Ranklao
              </span>
            </div>
            <CardTitle>Welcome to Ranklao</CardTitle>
            <CardDescription>
              Connect with proven rankers and transform your preparation
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={isLogin ? "login" : "signup"} onValueChange={(v) => setIsLogin(v === "login")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2" 
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    <FcGoogle className="h-5 w-5" />
                    <span>Sign in with Google</span>
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-card px-2 text-xs text-muted-foreground">OR</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2" 
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    <FcGoogle className="h-5 w-5" />
                    <span>Sign up with Google</span>
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-card px-2 text-xs text-muted-foreground">OR</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating Account..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="text-center text-sm text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
