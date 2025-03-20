import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface AISettingsTabProps {
  formData: any;
  updateFormData: (section: string, data: any) => void;
}

export default function AISettingsTab({ formData, updateFormData }: AISettingsTabProps) {
  return (
    <div className="mt-6">
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-900">AI Model</h4>
          <div className="mt-2">
            <Select 
              value={formData.aiModel} 
              onValueChange={(value) => updateFormData("aiModel", value)}
            >
              <SelectTrigger id="ai-model">
                <SelectValue placeholder="Select an AI model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OpenAI GPT-4">OpenAI GPT-4</SelectItem>
                <SelectItem value="OpenAI GPT-3.5 Turbo">OpenAI GPT-3.5 Turbo</SelectItem>
                <SelectItem value="Anthropic Claude">Anthropic Claude</SelectItem>
                <SelectItem value="Custom Model">Custom Model</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-900">AI Persona</h4>
          <div className="mt-2">
            <Textarea 
              id="ai-persona" 
              rows={3} 
              placeholder="You are a helpful customer support assistant for a tech company..."
              value={formData.aiPersona}
              onChange={(e) => updateFormData("aiPersona", e.target.value)}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Define how your AI should respond and behave when interacting with users.</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-900">Knowledge Base</h4>
          <div className="mt-2 space-y-2">
            <RadioGroup 
              value={formData.knowledgeSource} 
              onValueChange={(value) => updateFormData("knowledgeSource", value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="docs" id="kb-docs" />
                <Label htmlFor="kb-docs">Upload Documents</Label>
              </div>
              <div className="ml-7">
                {formData.knowledgeSource === "docs" && (
                  <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                          <span>Upload files</span>
                          <Input id="file-upload" type="file" className="sr-only" multiple />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOCX, TXT up to 10MB each
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="website" id="kb-website" />
                <Label htmlFor="kb-website">Crawl Website</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="api" id="kb-api" />
                <Label htmlFor="kb-api">Connect API</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-900">AI Settings</h4>
          <div className="mt-2 space-y-4">
            <div>
              <Label htmlFor="temperature">Temperature (Creativity)</Label>
              <Slider
                id="temperature"
                min={0}
                max={1}
                step={0.1}
                value={[formData.temperature]}
                onValueChange={(value) => updateFormData("temperature", value[0])}
                className="w-full h-2 bg-gray-200 rounded-lg mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Precise (0)</span>
                <span>Balanced (0.7)</span>
                <span>Creative (1)</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="max-tokens">Max Response Length</Label>
              <div className="mt-1">
                <Select 
                  value={formData.maxResponseLength} 
                  onValueChange={(value) => updateFormData("maxResponseLength", value)}
                >
                  <SelectTrigger id="max-tokens">
                    <SelectValue placeholder="Select maximum response length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Short (256 tokens)">Short (256 tokens)</SelectItem>
                    <SelectItem value="Medium (512 tokens)">Medium (512 tokens)</SelectItem>
                    <SelectItem value="Long (1024 tokens)">Long (1024 tokens)</SelectItem>
                    <SelectItem value="Very Long (2048 tokens)">Very Long (2048 tokens)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
