import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmbedCodeTabProps {
  formData: any;
  updateFormData: (data: string) => void;
}

export default function EmbedCodeTab({ formData, updateFormData }: EmbedCodeTabProps) {
  const { toast } = useToast();
  
  const generateEmbedCode = () => {
    const config = {
      botName: formData.name || "Support Assistant",
      primaryColor: formData.appearance?.primaryColor || "#3B82F6",
      position: formData.appearance?.position || "right",
      initialMessage: "Hi there! How can I help you today?"
    };
    
    return `<script>
  (function(d, t) {
    var g = d.createElement(t),
        s = d.getElementsByTagName(t)[0];
    g.src = "https://chatbotx.io/widget.js";
    g.async = true;
    g.setAttribute("data-id", "chatbot-12345");
    g.setAttribute("data-config", JSON.stringify(${JSON.stringify(config)}));
    s.parentNode.insertBefore(g, s);
  })(document, "script");
</script>`;
  };
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateEmbedCode())
      .then(() => {
        toast({
          title: "Copied!",
          description: "Embed code copied to clipboard",
        });
      })
      .catch((err) => {
        toast({
          title: "Failed to copy",
          description: "Please try again or copy manually",
          variant: "destructive",
        });
      });
  };
  
  return (
    <div className="mt-6">
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-900">Integration Method</h4>
          <div className="mt-2 space-y-2">
            <RadioGroup 
              value={formData.integrationMethod} 
              onValueChange={updateFormData}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="js" id="integration-js" />
                <Label htmlFor="integration-js">
                  JavaScript Snippet (Recommended)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="iframe" id="integration-iframe" />
                <Label htmlFor="integration-iframe">
                  iFrame Embed
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="api" id="integration-api" />
                <Label htmlFor="integration-api">
                  API Integration
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-900">JavaScript Code</h4>
          <div className="mt-2">
            <div className="relative">
              <pre className="block w-full bg-gray-800 text-gray-200 rounded-md p-4 overflow-x-auto text-xs font-mono">{generateEmbedCode()}</pre>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleCopyCode} 
                className="absolute top-2 right-2 text-gray-300 hover:text-white"
              >
                <span className="sr-only">Copy</span>
                <Copy className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Add this code to your website just before the closing &lt;/body&gt; tag.
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-900">Installation Instructions</h4>
          <div className="mt-2 prose prose-sm text-gray-500">
            <ol>
              <li>Copy the JavaScript snippet above.</li>
              <li>Paste it into your website's HTML, just before the closing <code>&lt;/body&gt;</code> tag.</li>
              <li>Save your changes and refresh your website.</li>
              <li>The chatbot should now appear in the bottom-right corner of your website.</li>
            </ol>
            <p>For more advanced integration options, including custom triggers and events, please refer to our <a href="#" className="text-primary-600 hover:text-primary-500">integration documentation</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
