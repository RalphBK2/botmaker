import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import StatsCard from "@/components/dashboard/stats-card";
import Chart from "@/components/dashboard/chart";
import ChatbotItem from "@/components/dashboard/chatbot-item";
import TemplateItem from "@/components/dashboard/template-item";
import ChatbotBuilderModal from "@/components/chatbot/builder-modal";
import { MessageSquare, LineChart, CheckCircle } from "lucide-react";
import ChatbotWidget from "@/components/chatbot/widget";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

interface DashboardData {
  chatbots: {
    id: string;
    name: string;
    flows: number;
    status: 'active' | 'draft' | 'inactive';
    color: string;
  }[];
  templates: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
  }[];
  stats: {
    activeChatbots: number;
    activeChatbotsChange: number;
    totalConversations: number;
    totalConversationsChange: number;
    resolutionRate: number;
    resolutionRateChange: number;
  };
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);
  const { user } = useAuth();

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard'],
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {/* Dashboard Header */}
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-display font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {user?.username}! Here's an overview of your chatbots and activity.
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Button variant="outline" className="mr-3">
                Import
              </Button>
              <Button onClick={() => setIsBuilderModalOpen(true)}>
                Create Chatbot
              </Button>
            </div>
          </div>
          
          {/* Stats Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white overflow-hidden shadow rounded-lg p-6 animate-pulse">
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              <StatsCard 
                title="Active Chatbots"
                value={data?.stats.activeChatbots || 0}
                change={data?.stats.activeChatbotsChange || 0}
                changeText="in the last 30 days"
                icon={<MessageSquare className="h-6 w-6" />}
                bgColor="bg-primary-100"
                iconColor="text-primary-600"
              />
              
              <StatsCard 
                title="Total Conversations"
                value={data?.stats.totalConversations || 0}
                change={data?.stats.totalConversationsChange || 0}
                changeText="from last month"
                icon={<LineChart className="h-6 w-6" />}
                bgColor="bg-secondary-100"
                iconColor="text-secondary-600"
              />
              
              <StatsCard 
                title="Resolution Rate"
                value={`${data?.stats.resolutionRate || 0}%`}
                change={data?.stats.resolutionRateChange || 0}
                changeText="from last week"
                icon={<CheckCircle className="h-6 w-6" />}
                bgColor="bg-accent-100"
                iconColor="text-accent-600"
              />
            </div>
          )}
          
          {/* Chart Section */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Conversation Metrics</h3>
              <p className="mt-1 text-sm text-gray-500">
                Last 30 days of chatbot activity and performance
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <Chart />
            </div>
          </div>
          
          {/* Recent Chatbots & Templates */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Recent Chatbots */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Your Chatbots</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Recently updated chatbots
                  </p>
                </div>
                <a href="/chatbots" className="text-sm font-medium text-primary-600 hover:text-primary-500">View all</a>
              </div>
              <div className="divide-y divide-gray-200">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="p-4 animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-md bg-gray-200 h-10 w-10"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  data?.chatbots.slice(0, 3).map((chatbot) => (
                    <ChatbotItem key={chatbot.id} chatbot={chatbot} />
                  ))
                )}
              </div>
            </div>
            
            {/* Templates */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Popular Templates</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Ready-to-use chatbot templates
                  </p>
                </div>
                <a href="/templates" className="text-sm font-medium text-primary-600 hover:text-primary-500">Browse all</a>
              </div>
              <div className="divide-y divide-gray-200">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="p-4 animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="rounded-md bg-gray-200 h-10 w-10"></div>
                          <div>
                            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-40"></div>
                          </div>
                        </div>
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  data?.templates.slice(0, 3).map((template) => (
                    <TemplateItem key={template.id} template={template} />
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <ChatbotBuilderModal 
        isOpen={isBuilderModalOpen} 
        setIsOpen={setIsBuilderModalOpen} 
      />
      
      <ChatbotWidget />
    </div>
  );
}
