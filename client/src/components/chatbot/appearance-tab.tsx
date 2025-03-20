import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AppearanceTabProps {
  formData: {
    primaryColor: string;
    fontFamily: string;
    borderRadius: string;
    position: string;
  };
  updateFormData: (data: any) => void;
}

export default function AppearanceTab({ formData, updateFormData }: AppearanceTabProps) {
  const [previewStyle, setPreviewStyle] = useState({
    primaryColor: formData.primaryColor,
    fontFamily: formData.fontFamily,
    borderRadius: "8px",
    position: formData.position,
  });
  
  useEffect(() => {
    // Update preview style when form data changes
    const borderRadiusMap: Record<string, string> = {
      "Sharp (0px)": "0px",
      "Slightly Rounded (4px)": "4px",
      "Rounded (8px)": "8px",
      "Very Rounded (12px)": "12px",
      "Circular (24px)": "24px",
    };
    
    setPreviewStyle({
      primaryColor: formData.primaryColor,
      fontFamily: formData.fontFamily,
      borderRadius: borderRadiusMap[formData.borderRadius] || "8px",
      position: formData.position,
    });
  }, [formData]);
  
  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-900">Theme Customization</h4>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="theme-color">Primary Color</Label>
              <div className="mt-1 flex items-center">
                <Input 
                  type="color" 
                  id="theme-color" 
                  value={formData.primaryColor}
                  onChange={(e) => updateFormData({ primaryColor: e.target.value })}
                  className="h-8 w-8 rounded-md border border-gray-300 cursor-pointer p-0"
                />
                <Input 
                  type="text" 
                  value={formData.primaryColor}
                  onChange={(e) => updateFormData({ primaryColor: e.target.value })}
                  className="ml-2"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="font-family">Font Family</Label>
              <div className="mt-1">
                <Select 
                  value={formData.fontFamily} 
                  onValueChange={(value) => updateFormData({ fontFamily: value })}
                >
                  <SelectTrigger id="font-family">
                    <SelectValue placeholder="Select a font family" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="border-radius">Border Radius</Label>
              <div className="mt-1">
                <Select 
                  value={formData.borderRadius} 
                  onValueChange={(value) => updateFormData({ borderRadius: value })}
                >
                  <SelectTrigger id="border-radius">
                    <SelectValue placeholder="Select border radius" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sharp (0px)">Sharp (0px)</SelectItem>
                    <SelectItem value="Slightly Rounded (4px)">Slightly Rounded (4px)</SelectItem>
                    <SelectItem value="Rounded (8px)">Rounded (8px)</SelectItem>
                    <SelectItem value="Very Rounded (12px)">Very Rounded (12px)</SelectItem>
                    <SelectItem value="Circular (24px)">Circular (24px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Chat Bubble Position</Label>
              <RadioGroup 
                value={formData.position} 
                onValueChange={(value) => updateFormData({ position: value })}
                className="mt-2 flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="right" id="position-right" />
                  <Label htmlFor="position-right">Right</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="left" id="position-left" />
                  <Label htmlFor="position-left">Left</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
        
        {/* Preview */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Preview</h4>
          <div 
            className="border border-gray-300 rounded-lg bg-white h-96 p-4 flex flex-col"
            style={{
              fontFamily: previewStyle.fontFamily,
              borderRadius: previewStyle.borderRadius,
            }}
          >
            <div className="border-b border-gray-200 pb-2 flex items-center">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: previewStyle.primaryColor }}
              >
                AI
              </div>
              <div className="ml-2 text-sm font-medium">Support Assistant</div>
            </div>
            <div className="flex-1 overflow-y-auto py-4 space-y-2">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: previewStyle.primaryColor }}
                  >
                    AI
                  </div>
                </div>
                <div 
                  className="bg-gray-100 rounded-lg rounded-tl-none px-4 py-2 max-w-md"
                  style={{ borderRadius: previewStyle.borderRadius }}
                >
                  <p className="text-sm text-gray-900">Hi there! How can I help you today?</p>
                </div>
              </div>
              <div className={`flex items-start ${previewStyle.position === 'right' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 ${previewStyle.position === 'right' ? 'ml-2' : 'mr-2'}`}>
                  <Avatar className="h-8 w-8 bg-gray-300">
                    <AvatarFallback className="text-gray-700 text-sm">U</AvatarFallback>
                  </Avatar>
                </div>
                <div 
                  className="text-white rounded-lg px-4 py-2 max-w-md"
                  style={{ 
                    backgroundColor: previewStyle.primaryColor,
                    borderRadius: previewStyle.borderRadius,
                    borderTopRightRadius: previewStyle.position === 'right' ? '0' : undefined,
                    borderTopLeftRadius: previewStyle.position === 'left' ? '0' : undefined,
                  }}
                >
                  <p className="text-sm">I'm looking for information about your pricing plans.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: previewStyle.primaryColor }}
                  >
                    AI
                  </div>
                </div>
                <div 
                  className="bg-gray-100 rounded-lg rounded-tl-none px-4 py-2 max-w-md"
                  style={{ borderRadius: previewStyle.borderRadius }}
                >
                  <p className="text-sm text-gray-900">Of course! We offer three pricing tiers: Basic at $10/month, Professional at $29/month, and Enterprise with custom pricing. Would you like me to explain the features of each plan?</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="mt-1 flex rounded-md shadow-sm">
                <Input 
                  type="text" 
                  placeholder="Type your message..." 
                  className="rounded-r-none"
                />
                <button 
                  type="button" 
                  className="ml-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-l-none rounded-r-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    backgroundColor: previewStyle.primaryColor,
                    borderColor: previewStyle.primaryColor,
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
