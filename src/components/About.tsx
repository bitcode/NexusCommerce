import React from 'react';
import Card from './Card';
import DualView from './DualView';

const About: React.FC = () => {
  return (
    <Card title="About Nexus Commerce">
      <DualView
        title="About Nexus Commerce"
        presentationView={
          <div>
            <p className="mb-4">
              Nexus Commerce is a modern e-commerce platform built with React and the Shopify Storefront API.
              It provides a seamless shopping experience with features like product browsing, cart management,
              and checkout integration.
            </p>
            <p className="mb-4">
              This application demonstrates the integration with Shopify's Storefront API using Apollo Client
              with support for features like the @defer directive for incremental loading.
            </p>
            <p className="mb-4">
              A key feature of this application is the dual-view functionality, which allows users to toggle
              between presentation views and raw data views at different levels of detail. The tree-style
              hierarchical view makes it easy to visualize complex data structures.
            </p>
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">Technology Stack</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>React + TypeScript for the frontend</li>
                <li>Tailwind CSS with ayu theme for styling</li>
                <li>Apollo Client for GraphQL integration</li>
                <li>Shopify Storefront API for e-commerce functionality</li>
                <li>Redux for state management</li>
              </ul>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">Project Roadmap</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Phase 1: UI Framework and Components (Completed)</li>
                <li>Phase 2: Dual-View Implementation (Completed)</li>
                <li>Phase 3: Storefront API Integration (In Progress)</li>
                <li>Phase 4: React Integration (Starting)</li>
                <li>Phase 5: Full E-commerce Functionality</li>
              </ul>
            </div>
          </div>
        }
        rawData={{
          name: "Nexus Commerce",
          version: "0.1.0",
          description: "A modern e-commerce platform with dual-view functionality",
          technologies: {
            frontend: ["React", "TypeScript", "Tailwind CSS", "Redux"],
            api: ["Apollo Client", "GraphQL", "Shopify Storefront API"],
            features: ["Dual-View", "Tree Hierarchy", "Dark/Light Mode"]
          },
          roadmap: [
            { phase: 1, name: "UI Framework and Components", status: "Completed" },
            { phase: 2, name: "Dual-View Implementation", status: "Completed" },
            { phase: 3, name: "Storefront API Integration", status: "In Progress" },
            { phase: 4, name: "React Integration", status: "Starting" },
            { phase: 5, name: "Full E-commerce Functionality", status: "Planned" }
          ],
          repository: {
            type: "git",
            url: "https://github.com/example/nexus-commerce"
          }
        }}
      />
    </Card>
  );
};

export default About;
