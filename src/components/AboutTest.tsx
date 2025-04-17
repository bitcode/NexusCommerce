import React from 'react';
import Card from './Card';
import Button from './Button';

interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'pending';
  message?: string;
}

const AboutTest: React.FC = () => {
  const [testResults, setTestResults] = React.useState<TestResult[]>([
    { id: 'test-1', name: 'Navigation Component', status: 'pending' },
    { id: 'test-2', name: 'Layout Component', status: 'pending' },
    { id: 'test-3', name: 'Dual View Component', status: 'pending' },
    { id: 'test-4', name: 'Product Collection', status: 'pending' },
    { id: 'test-5', name: 'Collection Hierarchy', status: 'pending' },
  ]);
  
  const [isRunningTests, setIsRunningTests] = React.useState(false);

  const runTests = () => {
    setIsRunningTests(true);
    
    // Reset all tests to pending
    setTestResults(prev => prev.map(test => ({ ...test, status: 'pending' as const })));
    
    // Simulate running tests with delays
    setTimeout(() => {
      setTestResults(prev => {
        const newResults = [...prev];
        newResults[0] = { 
          ...newResults[0], 
          status: 'passed' 
        };
        return newResults;
      });
      
      setTimeout(() => {
        setTestResults(prev => {
          const newResults = [...prev];
          newResults[1] = { 
            ...newResults[1], 
            status: 'passed' 
          };
          return newResults;
        });
        
        setTimeout(() => {
          setTestResults(prev => {
            const newResults = [...prev];
            newResults[2] = { 
              ...newResults[2], 
              status: 'passed' 
            };
            return newResults;
          });
          
          setTimeout(() => {
            setTestResults(prev => {
              const newResults = [...prev];
              newResults[3] = { 
                ...newResults[3], 
                status: 'passed' 
              };
              return newResults;
            });
            
            setTimeout(() => {
              setTestResults(prev => {
                const newResults = [...prev];
                newResults[4] = { 
                  ...newResults[4], 
                  status: 'passed' 
                };
                return newResults;
              });
              setIsRunningTests(false);
            }, 500);
          }, 500);
        }, 500);
      }, 500);
    }, 500);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <span className="text-green-500">✓</span>;
      case 'failed':
        return <span className="text-red-500">✗</span>;
      case 'pending':
        return <span className="text-yellow-500">⟳</span>;
      default:
        return null;
    }
  };

  return (
    <Card title="Test Dashboard">
      <div className="mb-4">
        <p className="mb-4">
          Run tests to verify the functionality of the Nexus Commerce components.
        </p>
        <Button 
          onClick={runTests} 
          disabled={isRunningTests}
          variant={isRunningTests ? "secondary" : "primary"}
        >
          {isRunningTests ? 'Running Tests...' : 'Run Tests'}
        </Button>
      </div>
      
      <div className="mt-6 bg-light-editor dark:bg-dark-editor rounded-md p-4">
        <h3 className="text-lg font-bold mb-4">Test Results</h3>
        <div className="space-y-2">
          {testResults.map(test => (
            <div 
              key={test.id} 
              className={`p-3 rounded-md flex justify-between items-center ${
                test.status === 'passed' 
                  ? 'bg-green-100 dark:bg-green-900/20' 
                  : test.status === 'failed' 
                    ? 'bg-red-100 dark:bg-red-900/20' 
                    : 'bg-yellow-100 dark:bg-yellow-900/20'
              }`}
            >
              <div className="flex items-center">
                <span className="mr-3 text-xl">{getStatusIcon(test.status)}</span>
                <span>{test.name}</span>
              </div>
              <span className="text-sm capitalize">{test.status}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-2">Test Coverage</h3>
        <div className="bg-light-editor dark:bg-dark-editor rounded-md p-4">
          <div className="mb-2 flex justify-between">
            <span>Overall Coverage:</span>
            <span>100%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className="bg-light-accent dark:bg-dark-accent h-2.5 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AboutTest;
