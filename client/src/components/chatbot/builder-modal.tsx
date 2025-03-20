import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettingsTab from "@/components/chatbot/settings-tab";
import AppearanceTab from "@/components/chatbot/appearance-tab";
import ConversationFlowsTab from "@/components/chatbot/conversation-flows-tab";
import AISettingsTab from "@/components/chatbot/ai-settings-tab";
import EmbedCodeTab from "@/components/chatbot/embed-code-tab";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface ChatbotBuilderModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  chatbotId?: string;
}

export default function ChatbotBuilderModal({
  isOpen,
  setIsOpen,
  chatbotId,
}: ChatbotBuilderModalProps) {
  const [activeTab, setActiveTab] = useState("settings");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    websiteUrl: "",
    language: "English",
    appearance: {
      primaryColor: "#3B82F6",
      fontFamily: "Inter",
      borderRadius: "Rounded (8px)",
      position: "right",
    },
    flows: [],
    aiModel: "OpenAI GPT-4",
    aiPersona: "",
    knowledgeSource: "docs",
    temperature: 0.7,
    maxResponseLength: "Medium (512 tokens)",
    integrationMethod: "js",
  });
  
  const { toast } = useToast();
  
  const updateFormData = (section: string, data: any) => {
    if (section === "") {
      // If section is empty, merge data directly into the root
      setFormData(prev => ({
        ...prev,
        ...data
      }));
    } else if (section === "flows") {
      // Special case for arrays like flows
      setFormData(prev => ({
        ...prev,
        flows: data
      }));
    } else {
      // For object properties
      setFormData(prev => {
        const updatedSection = {
          ...prev[section as keyof typeof prev],
          ...data
        };
        
        return {
          ...prev,
          [section]: updatedSection
        };
      });
    }
  };
  
  const saveChatbotMutation = useMutation({
    mutationFn: async () => {
      const endpoint = chatbotId 
        ? `/api/chatbots/${chatbotId}` 
        : "/api/chatbots";
      
      const method = chatbotId ? "PATCH" : "POST";
      
      return await apiRequest(method, endpoint, formData);
    },
    onSuccess: () => {
      toast({
        title: chatbotId ? "Chatbot updated" : "Chatbot created",
        description: chatbotId 
          ? "Your chatbot has been successfully updated" 
          : "Your new chatbot has been created successfully",
      });
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/chatbots'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save chatbot: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveChatbotMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {chatbotId ? "Edit Chatbot" : "Create New Chatbot"}
          </DialogTitle>
          <DialogDescription>
            Design your chatbot by configuring settings and creating conversation flows.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="settings" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="flows">Conversation Flows</TabsTrigger>
            <TabsTrigger value="ai">AI Settings</TabsTrigger>
            <TabsTrigger value="embed">Embed Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings">
            <SettingsTab 
              formData={formData} 
              updateFormData={(data) => updateFormData("", data)} 
            />
          </TabsContent>
          
          <TabsContent value="appearance">
            <AppearanceTab 
              formData={formData.appearance}
              updateFormData={(data) => updateFormData("appearance", data)} 
            />
          </TabsContent>
          
          <TabsContent value="flows">
            <ConversationFlowsTab 
              formData={formData}
              updateFormData={updateFormData} 
            />
          </TabsContent>
          
          <TabsContent value="ai">
            <AISettingsTab 
              formData={formData}
              updateFormData={updateFormData} 
            />
          </TabsContent>
          
          <TabsContent value="embed">
            <EmbedCodeTab 
              formData={formData}
              updateFormData={(data) => updateFormData("integrationMethod", data)} 
            />
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saveChatbotMutation.isPending}
          >
            {saveChatbotMutation.isPending ? "Saving..." : "Save Chatbot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
