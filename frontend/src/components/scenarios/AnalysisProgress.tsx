import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface AnalysisProgressProps {
  isAnalyzing: boolean;
  progress: number;
  currentStep?: string;
  error?: string;
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  isAnalyzing,
  progress,
  currentStep = 'Analyzing scenarios...',
  error,
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setDisplayProgress(prev => {
          if (prev >= progress) {
            clearInterval(interval);
            return progress;
          }
          return prev + 1;
        });
      }, 50);
      return () => clearInterval(interval);
    } else {
      setDisplayProgress(progress);
    }
  }, [isAnalyzing, progress]);

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Failed</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-gray-600">
            Please try again or contact support if the problem persists.
          </p>
        </div>
      </div>
    );
  }

  if (!isAnalyzing && progress === 100) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Complete</h3>
          <p className="text-gray-600">
            Your scenario analysis has been completed successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
          {isAnalyzing ? (
            <Clock className="h-8 w-8 text-blue-600 animate-pulse" />
          ) : (
            <CheckCircle className="h-8 w-8 text-blue-600" />
          )}
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isAnalyzing ? 'Running Analysis' : 'Analysis Progress'}
        </h3>
        <p className="text-gray-600">{currentStep}</p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{displayProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${displayProgress}%` }}
          />
        </div>
      </div>

      {isAnalyzing && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Processing your portfolio data...</span>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-blue-600">1</div>
          <div className="text-sm text-gray-600">Data Collection</div>
        </div>
        <div>
          <div className={`text-2xl font-bold ${displayProgress >= 50 ? 'text-blue-600' : 'text-gray-400'}`}>
            2
          </div>
          <div className="text-sm text-gray-600">Scenario Modeling</div>
        </div>
        <div>
          <div className={`text-2xl font-bold ${displayProgress >= 100 ? 'text-blue-600' : 'text-gray-400'}`}>
            3
          </div>
          <div className="text-sm text-gray-600">Results Generation</div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisProgress;
