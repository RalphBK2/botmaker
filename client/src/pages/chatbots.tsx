import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import ChatbotBuilderModal from "@/components/chatbot/builder-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PlusIcon, Search, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Chatbot {
  id: string;
  name: string;
  flows: number;
  status: 'active' | 'draft' | 'inactive';
  color: string;
  created: string;
  updated: string;
  conversations: number;
}

export default function Chatbots() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);
  const [selectedChatbot, setSelectedChatbot] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: chatbots, isLoading } = useQuery<Chatbot[]>({
    queryKey: ['/api/chatbots'],
  });
  
  const handleEditChatbot = (id: string) => {
    setSelectedChatbot(id);
    setIsBuilderModalOpen(true);
  };
  
  const getFilteredChatbots = (status?: string) => {
    if (!chatbots) return [];
    
    let filtered = chatbots;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(chatbot => 
        chatbot.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by status if provided
    if (status && status !== 'all') {
      filtered = filtered.filter(chatbot => chatbot.status === status);
    }
    
    return filtered;
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">Chatbots</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and create your AI chatbots
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex">
              <div className="w-full md:w-64 mr-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search chatbots..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={() => setIsBuilderModalOpen(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Chatbot
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Chatbots</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  // Loading skeletons
                  Array(6).fill(0).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-8 bg-gray-200 rounded mb-4"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : getFilteredChatbots().length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No chatbots found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchQuery ? 'Try adjusting your search query' : 'Get started by creating a new chatbot'}
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => setIsBuilderModalOpen(true)}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Create Chatbot
                      </Button>
                    </div>
                  </div>
                ) : (
                  getFilteredChatbots().map((chatbot) => (
                    <Card key={chatbot.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-md flex items-center justify-center text-white ${
                              chatbot.color === 'primary' ? 'bg-primary-600' :
                              chatbot.color === 'secondary' ? 'bg-secondary-600' : 'bg-accent-600'
                            }`}>
                              <MessageSquare className="h-6 w-6" />
                            </div>
                            <div className="ml-3">
                              <h3 className="text-base font-medium text-gray-900">{chatbot.name}</h3>
                            </div>
                          </div>
                          <Badge className={`
                            ${chatbot.status === 'active' ? 'bg-green-100 text-green-800' : 
                              chatbot.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'}
                          `}>
                            {chatbot.status.charAt(0).toUpperCase() + chatbot.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Conversations:</span>
                            <span className="font-medium">{chatbot.conversations}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Flows:</span>
                            <span className="font-medium">{chatbot.flows}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Last updated:</span>
                            <span className="font-medium">{new Date(chatbot.updated).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-4">
                          <Button
                            variant="outline"
                            className="flex-1"
                          >
                            Preview
                          </Button>
                          <Button 
                            className="flex-1"
                            onClick={() => handleEditChatbot(chatbot.id)}
                          >
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="active" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredChatbots('active').map((chatbot) => (
                  <Card key={chatbot.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-md flex items-center justify-center text-white ${
                            chatbot.color === 'primary' ? 'bg-primary-600' :
                            chatbot.color === 'secondary' ? 'bg-secondary-600' : 'bg-accent-600'
                          }`}>
                            <MessageSquare className="h-6 w-6" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-base font-medium text-gray-900">{chatbot.name}</h3>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Conversations:</span>
                          <span className="font-medium">{chatbot.conversations}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Flows:</span>
                          <span className="font-medium">{chatbot.flows}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Last updated:</span>
                          <span className="font-medium">{new Date(chatbot.updated).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-4">
                        <Button
                          variant="outline"
                          className="flex-1"
                        >
                          Preview
                        </Button>
                        <Button 
                          className="flex-1"
                          onClick={() => handleEditChatbot(chatbot.id)}
                        >
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="draft" className="mt-6">
              {/* Similar implementation for draft chatbots */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredChatbots('draft').map((chatbot) => (
                  <Card key={chatbot.id} className="hover:shadow-md transition-shadow">
                    {/* Similar card content as above */}
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-md flex items-center justify-center text-white ${
                            chatbot.color === 'primary' ? 'bg-primary-600' :
                            chatbot.color === 'secondary' ? 'bg-secondary-600' : 'bg-accent-600'
                          }`}>
                            <MessageSquare className="h-6 w-6" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-base font-medium text-gray-900">{chatbot.name}</h3>
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Draft
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Flows:</span>
                          <span className="font-medium">{chatbot.flows}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Created:</span>
                          <span className="font-medium">{new Date(chatbot.created).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-4">
                        <Button
                          variant="outline"
                          className="flex-1"
                        >
                          Preview
                        </Button>
                        <Button 
                          className="flex-1"
                          onClick={() => handleEditChatbot(chatbot.id)}
                        >
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="inactive" className="mt-6">
              {/* Similar implementation for inactive chatbots */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredChatbots('inactive').map((chatbot) => (
                  <Card key={chatbot.id} className="hover:shadow-md transition-shadow">
                    {/* Similar card content as above */}
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-md flex items-center justify-center text-white ${
                            chatbot.color === 'primary' ? 'bg-primary-600' :
                            chatbot.color === 'secondary' ? 'bg-secondary-600' : 'bg-accent-600'
                          }`}>
                            <MessageSquare className="h-6 w-6" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-base font-medium text-gray-900">{chatbot.name}</h3>
                          </div>
                        </div>
                        <Badge className="bg-gray-100 text-gray-800">
                          Inactive
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Conversations:</span>
                          <span className="font-medium">{chatbot.conversations}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Last active:</span>
                          <span className="font-medium">{new Date(chatbot.updated).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-4">
                        <Button
                          variant="outline"
                          className="flex-1"
                        >
                          Activate
                        </Button>
                        <Button 
                          className="flex-1"
                          onClick={() => handleEditChatbot(chatbot.id)}
                        >
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      <ChatbotBuilderModal 
        isOpen={isBuilderModalOpen} 
        setIsOpen={setIsBuilderModalOpen}
        chatbotId={selectedChatbot || undefined}
      />
    </div>
  );
}
