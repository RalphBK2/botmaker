import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, HelpCircle, ShoppingCart, Briefcase, Globe } from "lucide-react";
import ChatbotBuilderModal from "@/components/chatbot/builder-modal";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  complexity: 'simple' | 'moderate' | 'complex';
}

export default function Templates() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ['/api/templates'],
  });
  
  const handleUseTemplate = (id: string) => {
    setSelectedTemplate(id);
    setIsBuilderModalOpen(true);
  };
  
  const getFilteredTemplates = () => {
    if (!templates) return [];
    
    if (searchQuery) {
      return templates.filter(template => 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return templates;
  };
  
  const iconMap: Record<string, React.ReactNode> = {
    'help': <HelpCircle className="h-6 w-6" />,
    'shopping': <ShoppingCart className="h-6 w-6" />,
    'business': <Briefcase className="h-6 w-6" />,
    'website': <Globe className="h-6 w-6" />,
  };
  
  const colorMap: Record<string, string> = {
    'blue': 'bg-blue-100 text-blue-600',
    'green': 'bg-green-100 text-green-600',
    'purple': 'bg-purple-100 text-purple-600',
    'orange': 'bg-orange-100 text-orange-600',
    'red': 'bg-red-100 text-red-600',
  };
  
  const complexityMap: Record<string, string> = {
    'simple': 'bg-green-100 text-green-800',
    'moderate': 'bg-yellow-100 text-yellow-800',
    'complex': 'bg-red-100 text-red-800',
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">Templates</h1>
              <p className="mt-1 text-sm text-gray-500">
                Ready-to-use chatbot templates to get you started quickly
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="w-full md:w-64 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search templates..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Loading skeletons
              Array(6).fill(0).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="h-10 w-10 bg-gray-200 rounded-md"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="mt-4 h-10 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : getFilteredTemplates().length === 0 ? (
              <div className="col-span-full text-center py-12">
                <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No templates found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search query
                </p>
              </div>
            ) : (
              getFilteredTemplates().map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-md flex items-center justify-center ${colorMap[template.color] || 'bg-blue-100 text-blue-600'}`}>
                          {iconMap[template.icon] || <HelpCircle className="h-6 w-6" />}
                        </div>
                        <div className="ml-3">
                          <h3 className="text-base font-medium text-gray-900">{template.name}</h3>
                        </div>
                      </div>
                      <Badge className={complexityMap[template.complexity]}>
                        {template.complexity.charAt(0).toUpperCase() + template.complexity.slice(1)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-6">
                      {template.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{template.category}</Badge>
                      <Button onClick={() => handleUseTemplate(template.id)}>
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
      
      <ChatbotBuilderModal 
        isOpen={isBuilderModalOpen} 
        setIsOpen={setIsBuilderModalOpen}
      />
    </div>
  );
}
