import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { getQueryFn, apiRequest, queryClient } from '@/lib/queryClient';
import { Header } from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { Reward, PointsTransaction } from '@shared/schema';
import { Loader2, Gift, Star, Calendar, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function RewardsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('rewards');

  // Fetch rewards
  const { 
    data: rewards,
    isLoading: isLoadingRewards 
  } = useQuery<Reward[]>({
    queryKey: ['/api/rewards'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });

  // Fetch points transactions
  const {
    data: transactions,
    isLoading: isLoadingTransactions
  } = useQuery<PointsTransaction[]>({
    queryKey: ['/api/points-transactions'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });

  // Redeem points mutation
  const redeemMutation = useMutation({
    mutationFn: async (rewardId: number) => {
      const res = await apiRequest('POST', `/api/redeem-points/${rewardId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/points-transactions'] });
      toast({
        title: 'Reward redeemed!',
        description: 'Your points have been redeemed successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to redeem',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle redeem button click
  const handleRedeem = (reward: Reward) => {
    if (user && user.points >= reward.pointsCost) {
      redeemMutation.mutate(reward.id);
    } else {
      toast({
        title: 'Not enough points',
        description: `You need ${reward.pointsCost - (user?.points || 0)} more points to redeem this reward.`,
        variant: 'destructive',
      });
    }
  };

  // Format date helper
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoadingRewards || isLoadingTransactions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header>
        <h1 className="text-2xl font-bold text-foreground">Rewards & Points</h1>
      </Header>
      
      <main className="container max-w-4xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg p-6 mb-8 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg opacity-85">Available Points</h2>
              <div className="flex items-center mt-1">
                <Star className="h-7 w-7 mr-2 text-yellow-300" />
                <span className="text-4xl font-bold">{user?.points || 0}</span>
              </div>
            </div>
            <div className="hidden md:block opacity-75">
              <div className="text-sm">Earn 10 points for every $1 spent</div>
              <div className="text-sm mt-1">Redeem points for exclusive rewards</div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rewards">Available Rewards</TabsTrigger>
            <TabsTrigger value="history">Points History</TabsTrigger>
          </TabsList>

          <TabsContent value="rewards" className="mt-6">
            {rewards && rewards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rewards.map(reward => (
                  <Card key={reward.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50 pb-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-xl flex items-center">
                          <span className="text-3xl mr-3">{reward.imageUrl}</span>
                          {reward.name}
                        </CardTitle>
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          <Star className="h-3 w-3 mr-1 inline" /> {reward.pointsCost}
                        </Badge>
                      </div>
                      <CardDescription>{reward.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-4">
                      <Button 
                        onClick={() => handleRedeem(reward)} 
                        disabled={!user || user.points < reward.pointsCost || redeemMutation.isPending}
                        className="w-full"
                      >
                        {redeemMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Redeeming...
                          </>
                        ) : (
                          <>
                            <Gift className="mr-2 h-4 w-4" />
                            Redeem Reward
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Gift className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No rewards available</h3>
                <p className="text-muted-foreground mt-2">Check back soon for new rewards</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            {transactions && transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map(transaction => (
                  <Card key={transaction.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`p-2 rounded-full ${
                            transaction.transactionType === 'earn' 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {transaction.transactionType === 'earn' ? (
                              <RefreshCw className="h-5 w-5" />
                            ) : (
                              <Gift className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span>{formatDate(transaction.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`text-lg font-semibold ${
                          transaction.transactionType === 'earn' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {transaction.transactionType === 'earn' ? '+' : '-'}
                          {transaction.pointsAmount} 
                          <span className="ml-1 text-xs">points</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No transaction history</h3>
                <p className="text-muted-foreground mt-2">Complete a purchase to earn points</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}