'use client';

import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Node,
  Edge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node styles based on level
const getNodeStyle = (level: number) => {
  const styles = {
    0: { // Root node
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '20px 30px',
      fontSize: '18px',
      fontWeight: 'bold',
      boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
      minWidth: '200px',
      textAlign: 'center',
    },
    1: { // Level 1 nodes
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      padding: '16px 24px',
      fontSize: '16px',
      fontWeight: '600',
      boxShadow: '0 6px 12px rgba(240, 147, 251, 0.3)',
      minWidth: '160px',
      textAlign: 'center',
    },
    2: { // Level 2 nodes
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '12px 20px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 4px 8px rgba(79, 172, 254, 0.3)',
      minWidth: '140px',
      textAlign: 'center',
    },
    3: { // Level 3 nodes
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      color: '#334155',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 18px',
      fontSize: '13px',
      fontWeight: '500',
      boxShadow: '0 3px 6px rgba(168, 237, 234, 0.3)',
      minWidth: '120px',
      textAlign: 'center',
    },
  };
  return styles[level as keyof typeof styles] || styles[3];
};

// Calculate positions using hierarchical layout algorithm
const calculateNodePositions = (geminiData: any) => {
  const nodeMap = new Map();
  const childrenMap = new Map();
  
  // Build node map and children relationships
  geminiData.nodes.forEach((node: any) => {
    nodeMap.set(node.id, { ...node, children: [] });
    childrenMap.set(node.id, []);
  });
  
  // Build parent-child relationships from edges
  geminiData.edges.forEach((edge: any) => {
    const children = childrenMap.get(edge.source) || [];
    children.push(edge.target);
    childrenMap.set(edge.source, children);
  });
  
  // Find root node (node with no incoming edges)
  const targetNodes = new Set(geminiData.edges.map((e: any) => e.target));
  const rootNode = geminiData.nodes.find((n: any) => !targetNodes.has(n.id));
  
  if (!rootNode) return geminiData.nodes;
  
  // Calculate level for each node
  const levels = new Map();
  const queue = [{ id: rootNode.id, level: 0 }];
  
  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    levels.set(id, level);
    
    const children = childrenMap.get(id) || [];
    children.forEach((childId: string) => {
      queue.push({ id: childId, level: level + 1 });
    });
  }
  
  // Group nodes by level
  const nodesByLevel = new Map();
  geminiData.nodes.forEach((node: any) => {
    const level = levels.get(node.id) || 0;
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }
    nodesByLevel.get(level).push(node);
  });
  
  // Calculate positions
  const horizontalSpacing = 250;
  const verticalSpacing = 180;
  const positionedNodes = [];
  
  for (let level = 0; level <= 3; level++) {
    const nodesAtLevel = nodesByLevel.get(level) || [];
    const totalWidth = (nodesAtLevel.length - 1) * horizontalSpacing;
    const startX = -totalWidth / 2;
    
    nodesAtLevel.forEach((node: any, index: number) => {
      positionedNodes.push({
        ...node,
        position: {
          x: startX + (index * horizontalSpacing),
          y: level * verticalSpacing,
        },
        data: {
          ...node.data,
          level: level,
        },
      });
    });
  }
  
  return positionedNodes;
};

// Transform Gemini JSON to styled React Flow format
const transformGeminiData = (geminiData: any) => {
  const positionedNodes = calculateNodePositions(geminiData);
  
  const nodes: Node[] = positionedNodes.map((node: any) => ({
    id: node.id,
    type: node.type || 'default',
    data: { 
      label: node.data.label 
    },
    position: node.position,
    style: getNodeStyle(node.data.level),
  }));

  const edges: Edge[] = geminiData.edges.map((edge: any, index: number) => ({
    id: edge.id || `e${index}`,
    source: edge.source,
    target: edge.target,
    type: 'smoothstep',
    animated: edge.animated || false,
    style: { 
      stroke: '#94a3b8',
      strokeWidth: 2,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#94a3b8',
    },
  }));

  return { nodes, edges };
};

interface MindMapFlowchartProps {
  geminiData: any;
}

export default function MindMapFlowchart({ geminiData }: MindMapFlowchartProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => transformGeminiData(geminiData),
    [geminiData]
  );
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onInit = useCallback((reactFlowInstance: any) => {
    reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', background: '#f8fafc' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        fitView
        attributionPosition="bottom-left"
        minZoom={0.2}
        maxZoom={2}
      >
        <Controls 
          style={{ 
            button: { 
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
            } 
          }}
        />
        <MiniMap 
          nodeColor={(node) => {
            const colors = ['#667eea', '#f093fb', '#4facfe', '#a8edea'];
            const nodeData = initialNodes.find((n: any) => n.id === node.id);
            const level = nodeData?.data?.level || 0;
            return colors[level] || colors[3];
          }}
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        />
        <Background 
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="#cbd5e1"
        />
      </ReactFlow>
    </div>
  );
}