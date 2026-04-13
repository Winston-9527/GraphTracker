// Graph Visualization Types

export type NodeType = 'holder' | 'contract' | 'exchange' | 'whale' | 'unknown';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  balance: number;
  rank: number;
  address?: string;
  percentage?: number;
  // Cytoscape styling properties
  color?: string;
  size?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  label?: string;
  // Cytoscape styling properties
  color?: string;
  width?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphLayout {
  name: 'cose' | 'circle' | 'grid' | 'concentric' | 'breadthfirst' | 'random';
  padding?: number;
  animate?: boolean;
  animationDuration?: number;
}

export interface GraphStyle {
  backgroundColor?: string;
  nodeColors: Record<NodeType, string>;
  edgeColor: string;
  selectedNodeColor: string;
  highlightedEdgeColor: string;
}

export const DEFAULT_GRAPH_STYLE: GraphStyle = {
  backgroundColor: '#1a1a2e',
  nodeColors: {
    holder: '#4a90d9',
    contract: '#e74c3c',
    exchange: '#f39c12',
    whale: '#9b59b6',
    unknown: '#95a5a6'
  },
  edgeColor: '#34495e',
  selectedNodeColor: '#2ecc71',
  highlightedEdgeColor: '#e67e22'
};
