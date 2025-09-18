import { CheckCircle, TrendingUp } from 'lucide-react';
import React from 'react';

const ScenariosPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <TrendingUp className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Scenario Analysis</h1>
          <p className="text-lg text-gray-600">Coming Soon</p>
        </div>
        
        <div className="max-w-2xl mx-auto space-y-4 text-left">
          <h2 className="text-xl font-semibold text-gray-900">What's Coming:</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span><strong>Economic Scenario Testing</strong> - Test your portfolio against recession, inflation, and market volatility scenarios</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span><strong>AI-Powered Insights</strong> - Get detailed analysis and recommendations based on scenario outcomes</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span><strong>Risk Assessment</strong> - Understand how different economic conditions could impact your investments</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span><strong>Portfolio Optimization</strong> - Receive suggestions to improve your portfolio's resilience</span>
            </li>
          </ul>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Development Status:</strong> Scenario analysis is planned for Stage 3 development. 
              Focus is currently on perfecting the core portfolio management features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenariosPage;
