// Debug component for authentication state clearing
// This component provides manual authentication clearing for troubleshooting

import React, { useState } from 'react';
import { Trash2, RefreshCw, Info } from 'lucide-react';
import { authService } from '../../services/auth';
import { Button } from '../ui/Button';

interface AuthDebugProps {
  onAuthCleared?: () => void;
}

export const AuthDebug: React.FC<AuthDebugProps> = ({ onAuthCleared }) => {
  const [isClearing, setIsClearing] = useState(false);
  const [clearResult, setClearResult] = useState<string | null>(null);

  const handleClearAuth = async () => {
    setIsClearing(true);
    setClearResult(null);
    
    try {
      console.log('🧹 Manual auth state clearing initiated...');
      
      // Force clear authentication state
      await authService.forceSignOutAndClear();
      
      // Also clear any Redux persist storage
      if (typeof window !== 'undefined' && window.localStorage) {
        const keysToCheck = ['persist:root', 'auth', 'econlens-auth'];
        keysToCheck.forEach(key => {
          if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            console.log(`🗑️ Removed ${key} from localStorage`);
          }
        });
      }
      
      setClearResult('✅ Authentication state cleared successfully! You can now try logging in again.');
      onAuthCleared?.();
      
      // Refresh the page after a delay to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Failed to clear auth state:', error);
      setClearResult(`❌ Failed to clear authentication: ${error.message}`);
    } finally {
      setIsClearing(false);
    }
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <Info className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Authentication Troubleshooting
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p className="mb-3">
              If you're seeing "There is already a signed in user" error, 
              this tool can help clear any cached authentication state.
            </p>
            
            {clearResult && (
              <div className={`mb-3 p-2 rounded ${
                clearResult.includes('✅') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {clearResult}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleClearAuth}
                variant="outline"
                size="sm"
                isLoading={isClearing}
                loadingText="Clearing..."
                leftIcon={<Trash2 className="h-4 w-4" />}
                disabled={isClearing}
              >
                Clear Auth State
              </Button>
              
              <Button
                onClick={handleRefreshPage}
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className="h-4 w-4" />}
                disabled={isClearing}
              >
                Refresh Page
              </Button>
            </div>
            
            <p className="mt-3 text-xs text-yellow-600">
              Note: This will clear your authentication state and refresh the page.
              You'll need to log in again after using this tool.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;
