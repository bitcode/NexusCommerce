import React from 'react';
import Button from './components/Button';
import Card from './components/Card';
import ThemeToggle from './components/ThemeToggle';

const TestApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Nexus Commerce UI Components</h1>
          <ThemeToggle />
        </header>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Buttons</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Primary</h3>
              <div className="space-y-2">
                <Button variant="primary" size="sm">Small Button</Button>
                <Button variant="primary">Medium Button</Button>
                <Button variant="primary" size="lg">Large Button</Button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Secondary</h3>
              <div className="space-y-2">
                <Button variant="secondary" size="sm">Small Button</Button>
                <Button variant="secondary">Medium Button</Button>
                <Button variant="secondary" size="lg">Large Button</Button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Outline</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm">Small Button</Button>
                <Button variant="outline">Medium Button</Button>
                <Button variant="outline" size="lg">Large Button</Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Basic Card">
              <p>This is a basic card with a title.</p>
            </Card>
            
            <Card 
              title="Card with Footer" 
              footer={
                <div className="flex justify-end">
                  <Button variant="primary">Action</Button>
                </div>
              }
            >
              <p>This card has a footer with an action button.</p>
            </Card>
            
            <Card 
              title="Card with Header Action" 
              headerAction={<Button variant="outline" size="sm">Edit</Button>}
            >
              <p>This card has a header action button.</p>
            </Card>
            
            <Card>
              <p>This is a card without a title.</p>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TestApp;
