import type { GraphNode, GraphEdge } from '@/types/graph';

const WHALE_THRESHOLD_RATIO = 0.3;
const DIRECT_TX_WEIGHT = 1.5;
const SHARED_COUNTERPARTY_WEIGHT = 0.5;

export interface TransactionRecord {
  from: string;
  to: string;
  value: string;
  timestamp?: number;
}

export interface HolderInfo {
  address: string;
  balance: string;
  percentage: number;
  rank: number;
  label?: string;
}

export interface AddressRelation {
  addressA: string;
  addressB: string;
  commonCounterparties: string[];
  sharedTransactionCount: number;
  relationStrength: number;
}

export function classifyAddressType(
  address: string,
  balance: number,
  maxBalance: number,
  knownExchanges: Set<string> = new Set()
): 'holder' | 'contract' | 'exchange' | 'whale' {
  if (knownExchanges.has(address.toLowerCase())) {
    return 'exchange';
  }
  if (address.toLowerCase().startsWith('0x') && address.length === 42 && balance > maxBalance * 0.3) {
    return 'whale';
  }
  if (address.toLowerCase().startsWith('0x') && address.length > 42) {
    return 'contract';
  }
  return 'holder';
}

export function findCommonCounterparties(
  addressA: string,
  addressB: string,
  transactions: TransactionRecord[]
): { common: string[]; count: number } {
  const counterpartiesA = new Set<string>();
  const counterpartiesB = new Set<string>();

  for (const tx of transactions) {
    if (tx.from.toLowerCase() === addressA.toLowerCase() && tx.to) {
      counterpartiesA.add(tx.to.toLowerCase());
    }
    if (tx.to.toLowerCase() === addressA.toLowerCase() && tx.from) {
      counterpartiesA.add(tx.from.toLowerCase());
    }
    if (tx.from.toLowerCase() === addressB.toLowerCase() && tx.to) {
      counterpartiesB.add(tx.to.toLowerCase());
    }
    if (tx.to.toLowerCase() === addressB.toLowerCase() && tx.from) {
      counterpartiesB.add(tx.from.toLowerCase());
    }
  }

  const common: string[] = [];
  for (const c of counterpartiesA) {
    if (counterpartiesB.has(c)) {
      common.push(c);
    }
  }

  return { common, count: common.length };
}

export function findRelatedAddresses(
  targetAddress: string,
  allAddresses: string[],
  transactions: TransactionRecord[],
  minSharedCounterparties: number = 1
): AddressRelation[] {
  const relations: AddressRelation[] = [];

  for (const other of allAddresses) {
    if (other.toLowerCase() === targetAddress.toLowerCase()) continue;

    const { common, count } = findCommonCounterparties(targetAddress, other, transactions);

    if (count >= minSharedCounterparties) {
      const directTxs = transactions.filter(
        tx =>
          (tx.from.toLowerCase() === targetAddress.toLowerCase() && tx.to.toLowerCase() === other.toLowerCase()) ||
          (tx.from.toLowerCase() === other.toLowerCase() && tx.to.toLowerCase() === targetAddress.toLowerCase())
      );

      const relationStrength = count * 0.5 + directTxs.length * 1.5;

      relations.push({
        addressA: targetAddress,
        addressB: other,
        commonCounterparties: common,
        sharedTransactionCount: count,
        relationStrength
      });
    }
  }

  return relations.sort((a, b) => b.relationStrength - a.relationStrength);
}

export function calculateDegreeCentrality(nodes: GraphNode[], edges: GraphEdge[]): Map<string, number> {
  const centrality = new Map<string, number>();

  for (const node of nodes) {
    centrality.set(node.id, 0);
  }

  for (const edge of edges) {
    centrality.set(edge.source, (centrality.get(edge.source) || 0) + 1);
    centrality.set(edge.target, (centrality.get(edge.target) || 0) + 1);
  }

  return centrality;
}

export function findClusters(
  nodes: GraphNode[],
  edges: GraphEdge[],
  minClusterSize: number = 3
): GraphNode[][] {
  const adjacencyList = new Map<string, string[]>();

  for (const node of nodes) {
    adjacencyList.set(node.id, []);
  }

  for (const edge of edges) {
    adjacencyList.get(edge.source)?.push(edge.target);
    adjacencyList.get(edge.target)?.push(edge.source);
  }

  const visited = new Set<string>();
  const clusters: GraphNode[][] = [];

  for (const node of nodes) {
    if (visited.has(node.id)) continue;

    const cluster: GraphNode[] = [];
    const queue: string[] = [node.id];
    visited.add(node.id);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentNode = nodes.find(n => n.id === currentId);
      if (currentNode) {
        cluster.push(currentNode);
      }

      for (const neighbor of adjacencyList.get(currentId) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    if (cluster.length >= minClusterSize) {
      clusters.push(cluster);
    }
  }

  return clusters;
}

export function getTopNodesByDegree(
  nodes: GraphNode[],
  edges: GraphEdge[],
  topN: number = 10
): GraphNode[] {
  const centrality = calculateDegreeCentrality(nodes, edges);
  const sorted = [...nodes].sort(
    (a, b) => (centrality.get(b.id) || 0) - (centrality.get(a.id) || 0)
  );
  return sorted.slice(0, topN);
}
