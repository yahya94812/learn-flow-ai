'use client';

import MindMapFlowchart from '@/app/ui/MindMapFlowchart';

// Gemini only needs to provide nodes and edges - no coordinates needed!
const geminiGeneratedData = {
  "nodes": [
    { "id": "1", "data": { "label": "Web Development" } },
    { "id": "2", "data": { "label": "Frontend" } },
    { "id": "3", "data": { "label": "Backend" } },
    { "id": "4", "data": { "label": "DevOps" } },
    { "id": "5", "data": { "label": "React" } },
    { "id": "6", "data": { "label": "Vue" } },
    { "id": "7", "data": { "label": "Angular" } },
    { "id": "8", "data": { "label": "Node.js" } },
    { "id": "9", "data": { "label": "Python" } },
    { "id": "10", "data": { "label": "Docker" } },
    { "id": "11", "data": { "label": "Kubernetes" } },
    { "id": "12", "data": { "label": "Components" } },
    { "id": "13", "data": { "label": "Hooks" } },
    { "id": "14", "data": { "label": "Routing" } }
  ],
  "edges": [
    { "source": "1", "target": "2" },
    { "source": "1", "target": "3" },
    { "source": "1", "target": "4" },
    { "source": "2", "target": "5" },
    { "source": "2", "target": "6" },
    { "source": "2", "target": "7" },
    { "source": "3", "target": "8" },
    { "source": "3", "target": "9" },
    { "source": "4", "target": "10" },
    { "source": "4", "target": "11" },
    { "source": "5", "target": "12" },
    { "source": "5", "target": "13" },
    { "source": "5", "target": "14" }
  ]
};

export default function Page() {
  return <MindMapFlowchart geminiData={geminiGeneratedData} />;
}