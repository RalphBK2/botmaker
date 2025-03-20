import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CalendarIcon, BarChart3, PieChart as PieChartIcon, Users, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AnalyticsData {
  overview: {
    totalConversations: number;
    totalUsers: number;
    averageDuration: string;
    resolutionRate: number;
  };
  conversationsByDay: {
    date: string;
    conversations: number;
  }[];
  conversationsBySource: {
    source: string;
    value: number;
  }[];
  topQuestions: {
    question: string;
    count: number;
    resolutionRate: number;
  }[];
  performance: {
    metric: string;
    value: number;
    change: number;
  }[];
}

export default function Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [timeRange, setTimeRange] = useState("30d");

  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics', timeRange],
  });

  const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">Analytics</h1>
              <p className="mt-1 text-sm text-gray-500">
                Detailed insights into your chatbot performance
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <Select
                value={timeRange}
                onValueChange={setTimeRange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="year">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
          </div>
          
          {/* Overview Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {isLoading ? (
              // Loading skeletons
              Array(4).fill(0).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Conversations</p>
                        <p className="text-3xl font-semibold mt-2">{data?.overview.totalConversations.toLocaleString()}</p>
                      </div>
                      <div className="bg-primary-100 p-2 rounded-md">
                        <BarChart3 className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Unique Users</p>
                        <p className="text-3xl font-semibold mt-2">{data?.overview.totalUsers.toLocaleString()}</p>
                      </div>
                      <div className="bg-secondary-100 p-2 rounded-md">
                        <Users className="h-6 w-6 text-secondary-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Avg. Conversation Time</p>
                        <p className="text-3xl font-semibold mt-2">{data?.overview.averageDuration}</p>
                      </div>
                      <div className="bg-accent-100 p-2 rounded-md">
                        <Clock className="h-6 w-6 text-accent-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Resolution Rate</p>
                        <p className="text-3xl font-semibold mt-2">{data?.overview.resolutionRate}%</p>
                      </div>
                      <div className="bg-green-100 p-2 rounded-md">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          
          <Tabs defaultValue="overview" className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="questions">Top Questions</TabsTrigger>
              <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Conversations Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {isLoading ? (
                      <div className="w-full h-full bg-gray-100 animate-pulse rounded-md"></div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={data?.conversationsByDay}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="conversations"
                            stroke="var(--chart-1)"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Traffic Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      {isLoading ? (
                        <div className="w-full h-full bg-gray-100 animate-pulse rounded-md"></div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data?.conversationsBySource}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {data?.conversationsBySource.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      {isLoading ? (
                        <div className="w-full h-full bg-gray-100 animate-pulse rounded-md"></div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={data?.performance}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="metric" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="var(--chart-2)" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    {isLoading ? (
                      <div className="w-full h-full bg-gray-100 animate-pulse rounded-md"></div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={data?.performance}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="metric" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="var(--chart-2)" />
                          <Bar dataKey="change" fill="var(--chart-3)" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="questions">
              <Card>
                <CardHeader>
                  <CardTitle>Top Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-md"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data?.topQuestions.map((question, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-start">
                              <span className="bg-gray-100 text-gray-700 h-6 w-6 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                                {index + 1}
                              </span>
                              <div>
                                <p className="font-medium text-gray-900">{question.question}</p>
                                <p className="text-sm text-gray-500">Asked {question.count} times</p>
                              </div>
                            </div>
                            <Badge className={question.resolutionRate > 80 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                              {question.resolutionRate}% resolved
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sources">
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-80">
                      {isLoading ? (
                        <div className="w-full h-full bg-gray-100 animate-pulse rounded-md"></div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data?.conversationsBySource}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {data?.conversationsBySource.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                    
                    <div>
                      {isLoading ? (
                        <div className="space-y-4">
                          {Array(5).fill(0).map((_, i) => (
                            <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-md"></div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {data?.conversationsBySource.map((source, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center">
                                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="ml-2 font-medium">{source.source}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-semibold">{source.value}</span>
                                <span className="text-gray-500 text-sm ml-1">
                                  ({((source.value / data.conversationsBySource.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
