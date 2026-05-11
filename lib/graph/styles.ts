import cytoscape from 'cytoscape';

type ElementDefinition = cytoscape.ElementDefinition;
type Stylesheet = cytoscape.StylesheetStyle | cytoscape.StylesheetCSS;
import type { GraphData, GraphNode, GraphEdge, NodeType } from '@/types/graph';
import { DEFAULT_GRAPH_STYLE } from '@/types/graph';

const MIN_NODE_SIZE = 20;
const MAX_NODE_SIZE = 80;
const MIN_EDGE_WIDTH = 1;
const MAX_EDGE_WIDTH = 8;

export function getNodeSize(balance: number, maxBalance: number): number {
  if (maxBalance === 0) return MIN_NODE_SIZE;
  const ratio = Math.sqrt(balance / maxBalance);
  return Math.round(MIN_NODE_SIZE + ratio * (MAX_NODE_SIZE - MIN_NODE_SIZE));
}

export function getEdgeWidth(transactions: number, maxTransactions: number): number {
  if (maxTransactions === 0) return MIN_EDGE_WIDTH;
  const ratio = transactions / maxTransactions;
  return Math.max(MIN_EDGE_WIDTH, Math.round(MIN_EDGE_WIDTH + ratio * (MAX_EDGE_WIDTH - MIN_EDGE_WIDTH)));
}

export function getNodeTypeLabel(type: NodeType): string {
  const labels: Record<NodeType, string> = {
    holder: 'Holder',
    contract: 'Contract',
    exchange: 'Exchange',
    whale: 'Whale',
    unknown: 'Unknown'
  };
  return labels[type] || 'Unknown';
}

export function nodeToElement(node: GraphNode): ElementDefinition {
  return {
    group: 'nodes',
    data: {
      id: node.id,
      label: node.label,
      type: node.type,
      balance: node.balance,
      rank: node.rank,
      address: node.address || node.id,
      percentage: node.percentage || 0,
      size: node.size || 30,
      color: node.color || DEFAULT_GRAPH_STYLE.nodeColors[node.type] || DEFAULT_GRAPH_STYLE.nodeColors.unknown
    }
  };
}

export function edgeToElement(edge: GraphEdge): ElementDefinition {
  return {
    group: 'edges',
    data: {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      weight: edge.weight,
      label: edge.label || '',
      width: edge.width || 2,
      color: edge.color || DEFAULT_GRAPH_STYLE.edgeColor
    }
  };
}

export function graphDataToElements(data: GraphData): ElementDefinition[] {
  const nodes = data.nodes.map(nodeToElement);
  const edges = data.edges.map(edgeToElement);
  return [...nodes, ...edges];
}

export function getCytoscapeStylesheet(): Stylesheet[] {
  const style = DEFAULT_GRAPH_STYLE;

  return [
    {
      selector: 'node',
      style: {
        'background-color': 'data(color)',
        'width': 'data(size)',
        'height': 'data(size)',
        'label': 'data(label)',
        'color': '#e2e8f0',
        'font-size': '12px',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'text-margin-y': 6,
        'border-width': 2,
        'border-color': '#1a1a2e',
        'border-opacity': 0.8,
        'text-background-color': '#0f172a',
        'text-background-opacity': 0.7,
        'text-background-padding': '3px',
        'text-background-shape': 'roundrectangle',
        'min-zoomed-font-size': 8
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 'data(width)',
        'line-color': 'data(color)',
        'target-arrow-shape': 'triangle',
        'target-arrow-color': 'data(color)',
        'arrow-scale': 1.2,
        'curve-style': 'bezier',
        'opacity': 0.7,
        'label': 'data(label)',
        'font-size': '10px',
        'color': '#94a3b8',
        'text-background-color': '#0f172a',
        'text-background-opacity': 0.7,
        'text-background-padding': '2px',
        'text-background-shape': 'roundrectangle'
      }
    },
    {
      selector: ':selected',
      style: {
        'border-width': 4,
        'border-color': style.selectedNodeColor,
        'border-opacity': 1
      }
    },
    {
      selector: 'node:active',
      style: {
        'overlay-padding': 8,
        'overlay-color': style.selectedNodeColor,
        'overlay-opacity': 0.3
      }
    },
    {
      selector: '.highlighted',
      style: {
        'border-width': 3,
        'border-color': style.highlightedEdgeColor,
        'line-color': style.highlightedEdgeColor,
        'target-arrow-color': style.highlightedEdgeColor,
        'opacity': 1
      }
    },
    {
      selector: '.dimmed',
      style: {
        'opacity': 0.2
      }
    }
  ];
}

// Default layout configuration for cose-bilkent
export function getDefaultLayout() {
  return {
    name: 'cose-bilkent',
    animate: true,
    animationDuration: 500,
    idealEdgeLength: 120,
    nodeRepulsion: 4500,
    edgeElasticity: 0.45,
    nestingFactor: 0.1,
    gravity: 0.25,
    numIter: 2500,
    tile: true,
    tilingPaddingVertical: 10,
    tilingPaddingHorizontal: 10,
    gravityRangeCompound: 1.5,
    gravityCompound: 1.0,
    gravityRange: 3.8,
    initialEnergyOnIncremental: 0.5
  };
}
