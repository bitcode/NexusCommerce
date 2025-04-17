// Simple script to test the logging server

const testLogging = async () => {
  try {
    console.log('Sending test log to server...');
    
    const response = await fetch('http://localhost:3001/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'test',
        message: 'This is a test log message',
        details: {
          testId: 123,
          timestamp: new Date().toISOString(),
          source: 'test-logging.js'
        }
      }),
    });
    
    const data = await response.json();
    console.log('Server response:', data);
    
    if (data.success) {
      console.log('Test log sent successfully!');
    } else {
      console.error('Failed to send test log');
    }
  } catch (error) {
    console.error('Error sending test log:', error);
  }
};

// Run the test
testLogging();