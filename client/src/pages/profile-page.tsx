import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Settings, User, Award, LogOut, ShoppingBag, Gift } from "lucide-react";
import { useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  if (!user) {
    return null; // Protected route should handle this
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-4xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg p-6 mb-8 shadow-lg text-white">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white/20 rounded-full p-3 mr-4">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{user.username}</h1>
                <p className="text-indigo-100">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : "SmartCart Member"}
                </p>
              </div>
            </div>
            <div className="flex items-center bg-white/10 rounded-lg px-4 py-2">
              <Star className="h-5 w-5 text-yellow-300 mr-2" />
              <div>
                <p className="text-sm">Points Balance</p>
                <p className="text-xl font-bold">{user.points}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Award className="h-5 w-5 mr-2 text-indigo-600" />
                My Rewards
              </CardTitle>
              <CardDescription>View and redeem your rewards</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" onClick={() => navigate("/rewards")} className="w-full">
                <Gift className="mr-2 h-4 w-4" />
                View Rewards
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2 text-indigo-600" />
                Order History
              </CardTitle>
              <CardDescription>View your past orders</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" onClick={() => navigate("/order-history")} className="w-full">
                View Orders
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Settings className="h-5 w-5 mr-2 text-indigo-600" />
                Account Settings
              </CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" onClick={() => {}} className="w-full mb-2">
                Edit Profile
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => logoutMutation.mutate()} 
                className="w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-bold mb-4">About SmartCart</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="mb-4">
              SmartCart makes grocery shopping faster and more convenient by enabling you to scan your items as you shop.
              No more waiting in checkout lines!
            </p>
            <Separator className="my-4" />
            <div className="text-sm text-muted-foreground">
              <p>© 2025 SmartCart</p>
              <p>App Version 1.0</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}