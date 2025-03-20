import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

// Generate sample data for the chart
const generateData = () => {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      conversations: Math.floor(Math.random() * 50) + 20,
      resolutionRate: Math.floor(Math.random() * 30) + 60,
      avgTime: Math.floor(Math.random() * 60) + 30,
    });
  }
  return data;
};

export default function Chart() {
  const [data, setData] = useState<any[]>([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    // Generate initial chart data
    setData(generateData());
    
    // Handle window resize for responsive chart
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => windowWidth < 768 && data.length > 15 ? (data.indexOf(value) % 5 === 0 ? value : '') : value}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="conversations" 
            name="Conversations" 
            stroke="var(--chart-1)" 
            fill="var(--chart-1)" 
            fillOpacity={0.3} 
          />
          <Area 
            type="monotone" 
            dataKey="resolutionRate" 
            name="Resolution Rate (%)" 
            stroke="var(--chart-2)" 
            fill="var(--chart-2)" 
            fillOpacity={0.3} 
          />
          <Area 
            type="monotone" 
            dataKey="avgTime" 
            name="Avg Conversation Time (s)" 
            stroke="var(--chart-3)" 
            fill="var(--chart-3)" 
            fillOpacity={0.3} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
