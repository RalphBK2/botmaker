import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number | string;
  change: number;
  changeText: string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
}

export default function StatsCard({
  title,
  value,
  change,
  changeText,
  icon,
  bgColor,
  iconColor
}: StatsCardProps) {
  const isPositive = change > 0;
  
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", bgColor)}>
            <div className={iconColor}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className={cn(
          "text-sm",
          isPositive ? "text-green-600" : "text-red-600"
        )}>
          <span className="font-medium">{isPositive ? '+' : ''}{change}%</span> {changeText}
        </div>
      </div>
    </div>
  );
}
