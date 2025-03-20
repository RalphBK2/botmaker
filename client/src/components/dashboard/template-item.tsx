import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HelpCircle, ShoppingCart, Briefcase } from "lucide-react";

interface TemplateItemProps {
  template: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
  };
}

export default function TemplateItem({ template }: TemplateItemProps) {
  const iconMap: Record<string, React.ReactNode> = {
    'help': <HelpCircle className="h-6 w-6" />,
    'shopping': <ShoppingCart className="h-6 w-6" />,
    'business': <Briefcase className="h-6 w-6" />,
  };
  
  const colorMap: Record<string, string> = {
    'blue': 'bg-blue-100 text-blue-600',
    'green': 'bg-green-100 text-green-600',
    'purple': 'bg-purple-100 text-purple-600',
  };
  
  return (
    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={cn("h-10 w-10 rounded-md flex items-center justify-center", colorMap[template.color])}>
              {iconMap[template.icon] || <HelpCircle className="h-6 w-6" />}
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{template.name}</div>
            <div className="text-sm text-gray-500">{template.description}</div>
          </div>
        </div>
        <Button size="sm" variant="outline">
          Use Template
        </Button>
      </div>
    </div>
  );
}
