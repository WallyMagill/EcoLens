import React from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { PortfolioAsset } from '../../types/api';

interface AllocationChartProps {
  assets: PortfolioAsset[];
  totalValue?: number;
  className?: string;
}

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

const AllocationChart: React.FC<AllocationChartProps> = ({ assets, totalValue: propTotalValue, className = '' }) => {
  const calculatedTotalValue = assets.reduce((sum, asset) => sum + asset.dollarAmount, 0);
  const totalValue = propTotalValue || calculatedTotalValue;
  
  // Debug chart data processing
  console.log('Chart processed data:', {
    assets,
    totalValue,
    calculatedTotalValue,
    propTotalValue
  });

  const chartData = assets.map((asset, index) => ({
    name: asset.symbol,
    value: asset.dollarAmount,
    percentage: totalValue > 0 ? (asset.dollarAmount / totalValue) * 100 : 0,
    color: COLORS[index % COLORS.length],
  }));

  console.log('Chart processed data:', chartData);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Value: {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-gray-600">
            Allocation: {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (assets.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-50 rounded-lg ${className}`}>
        <div className="text-center">
          <p className="text-gray-500 text-lg">No assets to display</p>
          <p className="text-gray-400 text-sm">Add assets to see allocation chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Allocation</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Value</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(totalValue)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Assets</p>
          <p className="text-lg font-semibold text-gray-900">
            {assets.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AllocationChart;
