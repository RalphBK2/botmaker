import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, MessageSquare, ArrowRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Flow {
  id: string;
  name: string;
  type: "greeting" | "faq" | "support" | "custom";
  nodes: any[];
}

export default function ConversationFlowsTab({ formData, updateFormData }: any) {
  const [flows, setFlows] = useState<Flow[]>(formData?.flows || []);
  const [isAddFlowOpen, setIsAddFlowOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [newFlow, setNewFlow] = useState<Partial<Flow>>({
    name: "",
    type: "greeting"
  });
  
  const { toast } = useToast();
  
  const handleAddFlow = () => {
    if (!newFlow.name) {
      toast({
        title: "Error",
        description: "Please enter a flow name",
        variant: "destructive"
      });
      return;
    }
    
    const flow: Flow = {
      id: Date.now().toString(),
      name: newFlow.name,
      type: newFlow.type as "greeting" | "faq" | "support" | "custom",
      nodes: []
    };
    
    const updatedFlows = [...flows, flow];
    setFlows(updatedFlows);
    updateFormData("flows", updatedFlows);
    setIsAddFlowOpen(false);
    setNewFlow({ name: "", type: "greeting" });
    
    toast({
      title: "Flow Added",
      description: `New flow "${flow.name}" has been added successfully.`
    });
  };
  
  const handleTemplateSelect = (templateType: string) => {
    const flowName = 
      templateType === "greeting" ? "Welcome Message" :
      templateType === "faq" ? "Frequently Asked Questions" :
      templateType === "support" ? "Support Request" : "Custom Flow";
      
    const templateFlow: Flow = {
      id: Date.now().toString(),
      name: flowName,
      type: templateType as "greeting" | "faq" | "support" | "custom",
      nodes: []
    };
    
    const updatedFlows = [...flows, templateFlow];
    setFlows(updatedFlows);
    updateFormData("flows", updatedFlows);
    setIsTemplateOpen(false);
    
    toast({
      title: "Template Added",
      description: `New "${flowName}" flow has been added from template.`
    });
  };
  
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-medium text-gray-900">Conversation Flows</h4>
        <Button 
          size="sm"
          onClick={() => setIsAddFlowOpen(true)}
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Flow
        </Button>
      </div>
      
      {flows.length === 0 ? (
        // Empty state
        <div className="border border-dashed border-gray-300 rounded-lg bg-gray-50 p-6 text-center h-96 flex items-center justify-center flex-col">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">No conversation flows added yet.</p>
          <p className="text-xs text-gray-400">Add messages, conditions, user inputs, and integrations to create your flow.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setIsTemplateOpen(true)}
          >
            Start from Template
          </Button>
        </div>
      ) : (
        // Flow list
        <div className="space-y-4">
          {flows.map((flow) => (
            <div key={flow.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h5 className="font-medium">{flow.name}</h5>
                  <p className="text-sm text-gray-500 capitalize">{flow.type} flow</p>
                </div>
                <Button size="sm" variant="outline">
                  Edit Flow <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add Flow Dialog */}
      <Dialog open={isAddFlowOpen} onOpenChange={setIsAddFlowOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Flow</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="flow-name">Flow Name</Label>
              <Input 
                id="flow-name" 
                placeholder="e.g., Welcome Message"
                value={newFlow.name}
                onChange={(e) => setNewFlow({ ...newFlow, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="flow-type">Flow Type</Label>
              <Select 
                value={newFlow.type} 
                onValueChange={(value) => setNewFlow({ ...newFlow, type: value as any })}
              >
                <SelectTrigger id="flow-type">
                  <SelectValue placeholder="Select flow type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="greeting">Greeting</SelectItem>
                  <SelectItem value="faq">FAQ</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFlowOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFlow}>
              Add Flow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Template Selection Dialog */}
      <Dialog open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose a Template</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div 
              className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => handleTemplateSelect("greeting")}
            >
              <h3 className="font-medium">Welcome Message</h3>
              <p className="text-sm text-gray-500">Initial greeting for new users</p>
            </div>
            
            <div 
              className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => handleTemplateSelect("faq")}
            >
              <h3 className="font-medium">FAQ</h3>
              <p className="text-sm text-gray-500">Common questions and answers</p>
            </div>
            
            <div 
              className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => handleTemplateSelect("support")}
            >
              <h3 className="font-medium">Support Request</h3>
              <p className="text-sm text-gray-500">Customer support conversation</p>
            </div>
            
            <div 
              className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => handleTemplateSelect("custom")}
            >
              <h3 className="font-medium">Custom Flow</h3>
              <p className="text-sm text-gray-500">Build your own from scratch</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
