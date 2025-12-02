import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, colorClass }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center space-x-4 transition-transform duration-300 hover:scale-105">
      <div className={`rounded-full p-3 ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
        <p 
          className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white"
          data-tooltip-id="dashboard-card-tooltip"
          data-tooltip-content={String(value)}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

export default DashboardCard;