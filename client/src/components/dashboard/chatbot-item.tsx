import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChatbotItemProps {
  chatbot: {
    id: string;
    name: string;
    flows: number;
    status: 'active' | 'draft' | 'inactive';
    color: string;
  };
}

export default function ChatbotItem({ chatbot }: ChatbotItemProps) {
  const statusColors = {
    active: "bg-green-100 text-green-800",
    draft: "bg-yellow-100 text-yellow-800",
    inactive: "bg-gray-100 text-gray-800",
  };
  
  const statusLabel = {
    active: "Active",
    draft: "Draft",
    inactive: "Inactive",
  };
  
  const colorMap = {
    primary: "bg-primary-600",
    secondary: "bg-secondary-600",
    accent: "bg-accent-600",
  };
  
  return (
    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={cn("h-10 w-10 rounded-md flex items-center justify-center text-white", colorMap[chatbot.color as keyof typeof colorMap] || "bg-primary-600")}>
              <MessageSquare className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{chatbot.name}</div>
            <div className="text-sm text-gray-500">{chatbot.flows} conversation flows</div>
          </div>
        </div>
        <div>
          <Badge className={statusColors[chatbot.status]}>
            {statusLabel[chatbot.status]}
          </Badge>
        </div>
      </div>
    </div>
  );
}
