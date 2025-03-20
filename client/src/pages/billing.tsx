import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckIcon, CreditCard, DownloadIcon, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: PlanFeature[];
  chatbots: number;
  isPopular?: boolean;
  isCurrent?: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl: string;
}

interface BillingData {
  currentPlan: Plan;
  plans: Plan[];
  billingInfo: {
    name: string;
    card: {
      last4: string;
      brand: string;
      expMonth: number;
      expYear: number;
    };
    nextBillingDate: string;
  };
  invoices: Invoice[];
}

export default function Billing() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const { toast } = useToast();

  const { data, isLoading } = useQuery<BillingData>({
    queryKey: ['/api/billing'],
  });

  const upgradePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      return await apiRequest("POST", "/api/billing/upgrade", { planId });
    },
    onSuccess: () => {
      toast({
        title: "Plan upgraded",
        description: "Your subscription has been updated successfully",
      });
      setIsUpgradeDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/billing'] });
    },
    onError: (error) => {
      toast({
        title: "Upgrade failed",
        description: error instanceof Error ? error.message : "An error occurred while upgrading your plan",
        variant: "destructive",
      });
    },
  });

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsUpgradeDialogOpen(true);
  };

  const handleUpgrade = () => {
    if (selectedPlan) {
      upgradePlanMutation.mutate(selectedPlan.id);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-display font-bold text-gray-900">Billing</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your subscription and payment methods
            </p>
          </div>
          
          <Tabs defaultValue="plans" className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
              <TabsTrigger value="payment">Payment Method</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
            </TabsList>
            
            <TabsContent value="plans">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Array(3).fill(0).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-64 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
                    <div className="mr-3 mt-0.5">
                      <AlertCircle className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Current Plan: {data?.currentPlan.name}</h3>
                      <p className="mt-1 text-sm text-blue-700">
                        You are currently on the {data?.currentPlan.name} plan, which renews on {data?.billingInfo.nextBillingDate}.
                      </p>
                    </div>
                  </div>
              
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {data?.plans.map((plan) => (
                      <Card key={plan.id} className={`relative ${plan.isPopular ? 'border-primary-200 shadow-lg' : ''}`}>
                        {plan.isPopular && (
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <Badge className="bg-primary-600">Most Popular</Badge>
                          </div>
                        )}
                        {plan.isCurrent && (
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <Badge className="bg-secondary-600">Current Plan</Badge>
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle>{plan.name}</CardTitle>
                          <CardDescription>{plan.description}</CardDescription>
                          <div className="mt-2">
                            <span className="text-3xl font-bold">${plan.price}</span>
                            <span className="text-gray-500 ml-1">/month</span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            <li className="flex items-center">
                              <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.isPopular ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}`}>
                                <CheckIcon className="h-3 w-3" />
                              </div>
                              <span className="ml-2 text-sm text-gray-600">
                                <strong>{plan.chatbots}</strong> chatbots
                              </span>
                            </li>
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-center">
                                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${feature.included ? (plan.isPopular ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600') : 'bg-gray-100 text-gray-400'}`}>
                                  {feature.included ? (
                                    <CheckIcon className="h-3 w-3" />
                                  ) : (
                                    <span className="h-0.5 w-2 bg-gray-400"></span>
                                  )}
                                </div>
                                <span className={`ml-2 text-sm ${feature.included ? 'text-gray-600' : 'text-gray-400'}`}>
                                  {feature.name}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Button
                            className={`w-full ${plan.isPopular ? '' : 'bg-gray-800 hover:bg-gray-700'}`}
                            disabled={plan.isCurrent}
                            onClick={() => handlePlanSelect(plan)}
                          >
                            {plan.isCurrent ? 'Current Plan' : 'Upgrade to ' + plan.name}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="payment">
              {isLoading ? (
                <Card className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-40 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>Your current payment method details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <div className="bg-gray-100 p-3 rounded-md">
                        <CreditCard className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{data?.billingInfo.card.brand} •••• {data?.billingInfo.card.last4}</p>
                        <p className="text-sm text-gray-500">Expires {data?.billingInfo.card.expMonth}/{data?.billingInfo.card.expYear}</p>
                        <p className="text-sm text-gray-500">Billing name: {data?.billingInfo.name}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <p className="text-sm text-gray-500">
                      Next billing date: <span className="font-medium">{data?.billingInfo.nextBillingDate}</span>
                    </p>
                    <Button variant="outline">Update Payment Method</Button>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="invoices">
              <Card>
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>View and download your past invoices</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : data?.invoices && data.invoices.length > 0 ? (
                    <div className="space-y-3">
                      {data.invoices.map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{new Date(invoice.date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-500">${invoice.amount.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={
                              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                              invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </Badge>
                            <Button variant="ghost" size="sm" asChild>
                              <a href={invoice.downloadUrl} download>
                                <DownloadIcon className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No invoices available yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              You are about to upgrade to the {selectedPlan?.name} plan at ${selectedPlan?.price}/month.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>Your new plan includes:</p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Up to {selectedPlan?.chatbots} chatbots</span>
              </li>
              {selectedPlan?.features.filter(f => f.included).map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>{feature.name}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-500">
              Your card ending in {data?.billingInfo.card.last4} will be charged ${selectedPlan?.price} immediately, and your new billing cycle will start today.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpgrade} disabled={upgradePlanMutation.isPending}>
              {upgradePlanMutation.isPending ? "Processing..." : "Confirm Upgrade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
