import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SettingsTabProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function SettingsTab({ formData, updateFormData }: SettingsTabProps) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
      <div className="sm:col-span-4">
        <Label htmlFor="bot-name">Chatbot Name</Label>
        <div className="mt-1">
          <Input 
            type="text" 
            id="bot-name" 
            placeholder="e.g., Support Assistant"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
          />
        </div>
      </div>
      
      <div className="sm:col-span-6">
        <Label htmlFor="description">Description</Label>
        <div className="mt-1">
          <Textarea 
            id="description" 
            rows={3} 
            placeholder="Brief description of your chatbot's purpose"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">Brief description of your chatbot's purpose.</p>
      </div>
      
      <div className="sm:col-span-3">
        <Label htmlFor="website-url">Website URL</Label>
        <div className="mt-1">
          <Input 
            type="text" 
            id="website-url" 
            placeholder="https://example.com"
            value={formData.websiteUrl}
            onChange={(e) => updateFormData({ websiteUrl: e.target.value })}
          />
        </div>
      </div>
      
      <div className="sm:col-span-3">
        <Label htmlFor="language">Language</Label>
        <div className="mt-1">
          <Select 
            value={formData.language} 
            onValueChange={(value) => updateFormData({ language: value })}
          >
            <SelectTrigger id="language">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Spanish">Spanish</SelectItem>
              <SelectItem value="French">French</SelectItem>
              <SelectItem value="German">German</SelectItem>
              <SelectItem value="Japanese">Japanese</SelectItem>
              <SelectItem value="Chinese">Chinese</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
