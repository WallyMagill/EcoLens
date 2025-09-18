import React from 'react';
import { CheckCircle, Circle, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import type { Scenario } from '../../types/api';

interface ScenarioCardProps {
  scenario: Scenario;
  isSelected: boolean;
  onSelect: (scenarioId: string) => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ 
  scenario, 
  isSelected, 
  onSelect 
}) => {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  return (
    <div
      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={() => onSelect(scenario.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {scenario.name}
          </h3>
          {scenario.description && (
            <p className="text-sm text-gray-600 mb-3">
              {scenario.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center">
          {isSelected ? (
            <CheckCircle className="h-6 w-6 text-blue-600" />
          ) : (
            <Circle className="h-6 w-6 text-gray-400" />
          )}
        </div>
      </div>

      {scenario.parameters && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Risk Level</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(scenario.parameters.riskLevel)}`}>
              {getRiskIcon(scenario.parameters.riskLevel)}
              <span className="ml-1 capitalize">{scenario.parameters.riskLevel}</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Time Horizon</span>
            <div className="flex items-center text-sm text-gray-900">
              <Clock className="h-4 w-4 mr-1" />
              {scenario.parameters.timeHorizon} years
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Market Conditions</span>
            <div className="flex items-center text-sm text-gray-900">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="truncate max-w-32">
                {scenario.parameters.marketConditions}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Created: {new Date(scenario.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(scenario.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ScenarioCard;
