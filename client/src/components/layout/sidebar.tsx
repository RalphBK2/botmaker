import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import {
  Home,
  MessageSquare,
  Settings as SettingsIcon,
  BarChart2,
  CreditCard,
  User,
  LogOut,
  FileText,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Chatbots", href: "/chatbots", icon: MessageSquare },
    { name: "Templates", href: "/templates", icon: FileText },
    { name: "Analytics", href: "/analytics", icon: BarChart2 },
    { name: "Billing", href: "/billing", icon: CreditCard },
  ];

  const accountNavigation = [
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: SettingsIcon },
  ];

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out md:relative",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <span className="text-2xl font-display font-bold text-primary-600">ChatbotX</span>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          <div className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</div>
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  isActive 
                    ? "bg-primary-50 text-primary-700" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
          
          <div className="px-2 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</div>
          {accountNavigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  isActive 
                    ? "bg-primary-50 text-primary-700" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
          <button
            onClick={() => logout()}
            className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </nav>
        
        {/* Subscription information */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary-100">
                <span className="text-sm font-medium leading-none text-primary-800">P</span>
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Professional Plan</p>
              <p className="text-xs text-gray-500">Renews on Oct 28, 2023</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
