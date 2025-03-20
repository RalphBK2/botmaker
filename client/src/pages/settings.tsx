import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const apiSettingsSchema = z.object({
  openAiApiKey: z.string().min(1, "API Key is required"),
  defaultModel: z.string().min(1, "Default model is required"),
  apiRateLimit: z.number().min(1, "Rate limit must be at least 1"),
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  chatbotUpdates: z.boolean(),
  weeklyReports: z.boolean(),
  securityAlerts: z.boolean(),
  marketingEmails: z.boolean(),
});

const appearanceSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  accentColor: z.string(),
  sidebarCollapsed: z.boolean(),
});

interface ApiSettings {
  openAiApiKey: string;
  defaultModel: string;
  apiRateLimit: number;
}

interface NotificationSettings {
  emailNotifications: boolean;
  chatbotUpdates: boolean;
  weeklyReports: boolean;
  securityAlerts: boolean;
  marketingEmails: boolean;
}

interface AppearanceSettings {
  theme: "light" | "dark" | "system";
  accentColor: string;
  sidebarCollapsed: boolean;
}

interface SettingsData {
  api: ApiSettings;
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
}

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<SettingsData>({
    queryKey: ['/api/settings'],
  });

  const apiSettingsForm = useForm<z.infer<typeof apiSettingsSchema>>({
    resolver: zodResolver(apiSettingsSchema),
    defaultValues: {
      openAiApiKey: "",
      defaultModel: "gpt-4o",
      apiRateLimit: 60,
    },
  });

  const notificationSettingsForm = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      chatbotUpdates: true,
      weeklyReports: true,
      securityAlerts: true,
      marketingEmails: false,
    },
  });

  const appearanceSettingsForm = useForm<z.infer<typeof appearanceSettingsSchema>>({
    resolver: zodResolver(appearanceSettingsSchema),
    defaultValues: {
      theme: "light",
      accentColor: "#3B82F6",
      sidebarCollapsed: false,
    },
  });

  // Set form values when data is loaded
  useState(() => {
    if (data) {
      apiSettingsForm.reset({
        openAiApiKey: data.api.openAiApiKey,
        defaultModel: data.api.defaultModel,
        apiRateLimit: data.api.apiRateLimit,
      });
      
      notificationSettingsForm.reset({
        emailNotifications: data.notifications.emailNotifications,
        chatbotUpdates: data.notifications.chatbotUpdates,
        weeklyReports: data.notifications.weeklyReports,
        securityAlerts: data.notifications.securityAlerts,
        marketingEmails: data.notifications.marketingEmails,
      });
      
      appearanceSettingsForm.reset({
        theme: data.appearance.theme,
        accentColor: data.appearance.accentColor,
        sidebarCollapsed: data.appearance.sidebarCollapsed,
      });
    }
  });

  const updateApiSettingsMutation = useMutation({
    mutationFn: async (values: z.infer<typeof apiSettingsSchema>) => {
      return await apiRequest("PATCH", "/api/settings/api", values);
    },
    onSuccess: () => {
      toast({
        title: "API settings updated",
        description: "Your API settings have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update API settings",
        variant: "destructive",
      });
    },
  });

  const updateNotificationSettingsMutation = useMutation({
    mutationFn: async (values: z.infer<typeof notificationSettingsSchema>) => {
      return await apiRequest("PATCH", "/api/settings/notifications", values);
    },
    onSuccess: () => {
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update notification settings",
        variant: "destructive",
      });
    },
  });

  const updateAppearanceSettingsMutation = useMutation({
    mutationFn: async (values: z.infer<typeof appearanceSettingsSchema>) => {
      return await apiRequest("PATCH", "/api/settings/appearance", values);
    },
    onSuccess: () => {
      toast({
        title: "Appearance settings updated",
        description: "Your appearance preferences have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update appearance settings",
        variant: "destructive",
      });
    },
  });

  const onApiSettingsSubmit = (values: z.infer<typeof apiSettingsSchema>) => {
    updateApiSettingsMutation.mutate(values);
  };

  const onNotificationSettingsSubmit = (values: z.infer<typeof notificationSettingsSchema>) => {
    updateNotificationSettingsMutation.mutate(values);
  };

  const onAppearanceSettingsSubmit = (values: z.infer<typeof appearanceSettingsSchema>) => {
    updateAppearanceSettingsMutation.mutate(values);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-display font-bold text-gray-900">Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Configure your account settings and preferences
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load settings. Please try again later.
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="api" className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="api">API Settings</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle>API Integration Settings</CardTitle>
                  <CardDescription>Configure your AI model and API settings</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-10 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <Form {...apiSettingsForm}>
                      <form onSubmit={apiSettingsForm.handleSubmit(onApiSettingsSubmit)} className="space-y-4">
                        <FormField
                          control={apiSettingsForm.control}
                          name="openAiApiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>OpenAI API Key</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" placeholder="Enter your OpenAI API key" />
                              </FormControl>
                              <FormDescription>
                                Your API key is stored securely and used for AI chatbot functionality.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={apiSettingsForm.control}
                          name="defaultModel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default AI Model</FormLabel>
                              <Select 
                                value={field.value} 
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a model" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="gpt-4o">GPT-4o (Recommended)</SelectItem>
                                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                  <SelectItem value="claude-v2">Claude 2</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                This model will be used for all new chatbots by default.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={apiSettingsForm.control}
                          name="apiRateLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Rate Limit (requests per minute)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={1} 
                                  max={100} 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>
                                Limit the number of API requests your chatbots can make per minute.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            disabled={updateApiSettingsMutation.isPending || !apiSettingsForm.formState.isDirty}
                          >
                            {updateApiSettingsMutation.isPending ? "Saving..." : "Save API Settings"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage how and when you receive notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-10 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <Form {...notificationSettingsForm}>
                      <form onSubmit={notificationSettingsForm.handleSubmit(onNotificationSettingsSubmit)} className="space-y-4">
                        <FormField
                          control={notificationSettingsForm.control}
                          name="emailNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Email Notifications</FormLabel>
                                <FormDescription>
                                  Receive notifications via email
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <Separator />
                        
                        <div className="text-sm font-medium text-gray-700 mb-2">Notification Types</div>
                        
                        <FormField
                          control={notificationSettingsForm.control}
                          name="chatbotUpdates"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Chatbot Updates</FormLabel>
                                <FormDescription>
                                  Notifications about your chatbot activity and performance
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={!notificationSettingsForm.watch("emailNotifications")}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationSettingsForm.control}
                          name="weeklyReports"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Weekly Reports</FormLabel>
                                <FormDescription>
                                  Weekly summary of your chatbot performance and analytics
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={!notificationSettingsForm.watch("emailNotifications")}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationSettingsForm.control}
                          name="securityAlerts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Security Alerts</FormLabel>
                                <FormDescription>
                                  Important security notifications about your account
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationSettingsForm.control}
                          name="marketingEmails"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Marketing Emails</FormLabel>
                                <FormDescription>
                                  Product updates, tips, and promotional offers
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={!notificationSettingsForm.watch("emailNotifications")}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            disabled={updateNotificationSettingsMutation.isPending || !notificationSettingsForm.formState.isDirty}
                          >
                            {updateNotificationSettingsMutation.isPending ? "Saving..." : "Save Notification Settings"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>Customize the look and feel of your dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-10 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <Form {...appearanceSettingsForm}>
                      <form onSubmit={appearanceSettingsForm.handleSubmit(onAppearanceSettingsSubmit)} className="space-y-4">
                        <FormField
                          control={appearanceSettingsForm.control}
                          name="theme"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Theme</FormLabel>
                              <Select 
                                value={field.value} 
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a theme" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="light">Light</SelectItem>
                                  <SelectItem value="dark">Dark</SelectItem>
                                  <SelectItem value="system">System Default</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Choose your preferred color theme.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={appearanceSettingsForm.control}
                          name="accentColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Accent Color</FormLabel>
                              <div className="flex items-center space-x-2">
                                <FormControl>
                                  <Input type="color" {...field} className="w-12 h-10 p-1" />
                                </FormControl>
                                <Input type="text" value={field.value} onChange={(e) => field.onChange(e.target.value)} />
                              </div>
                              <FormDescription>
                                Choose your preferred accent color.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={appearanceSettingsForm.control}
                          name="sidebarCollapsed"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Collapsed Sidebar by Default</FormLabel>
                                <FormDescription>
                                  Start with a collapsed sidebar for more screen space
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            disabled={updateAppearanceSettingsMutation.isPending || !appearanceSettingsForm.formState.isDirty}
                          >
                            {updateAppearanceSettingsMutation.isPending ? "Saving..." : "Save Appearance Settings"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Management</CardTitle>
                  <CardDescription>Manage your account and subscription</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="text-base font-medium">Data Export</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Export all your data including chatbots, conversations, and settings
                    </p>
                    <Button className="mt-4" variant="outline">Export All Data</Button>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <h3 className="text-base font-medium">Account Deletion</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Permanently delete your account and all associated data
                    </p>
                    <Button className="mt-4" variant="destructive">Delete Account</Button>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-start border-t px-6 py-4">
                  <h4 className="text-sm font-medium mb-2">Support</h4>
                  <p className="text-sm text-gray-500">
                    Need help with your settings? Contact our support team at 
                    <a href="mailto:support@chatbotx.io" className="text-primary-600 ml-1">support@chatbotx.io</a>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
