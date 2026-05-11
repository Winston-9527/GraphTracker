import type { GraphNode, GraphEdge, GraphData } from '@/types/graph';
import type { TransactionRecord, HolderInfo } from './algorithms';
import { classifyAddressType, findRelatedAddresses } from './algorithms';
import { getNodeSize, getEdgeWidth } from './styles';

const MAX_NODES = 100;
const MIN_RELATION_STRENGTH = 0.5;
const MAX_EDGES_PER_NODE = 8;

export interface BuildGraphInput {
  tokenAddress: string;
  holders: HolderInfo[];
  transactions: TransactionRecord[];
  knownExchanges?: string[];
}

export interface TokenNodeData {
  address: string;
  percentage: number;
  transactionCount: number;
}

export function buildGraphData(input: BuildGraphInput): GraphData {
  const { tokenAddress, holders, transactions, knownExchanges = [] } = input;
  const exchangeSet = new Set(knownExchanges.map(e => e.toLowerCase()));

  const sortedHolders = [...holders].sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
  const limitedHolders = sortedHolders.slice(0, MAX_NODES);

  const maxBalance = Math.max(...limitedHolders.map(h => parseFloat(h.balance)), 1);

  const nodes: GraphNode[] = limitedHolders.map((holder, index) => {
    const balance = parseFloat(holder.balance);
    const type = classifyAddressType(holder.address, balance, maxBalance, exchangeSet);

    return {
      id: holder.address.toLowerCase(),
      label: holder.label || `${holder.address.slice(0, 6)}...${holder.address.slice(-4)}`,
      type,
      balance,
      rank: holder.rank || index + 1,
      address: holder.address,
      percentage: holder.percentage,
      size: getNodeSize(balance, maxBalance)
    };
  });

  const nodeIds = new Set(nodes.map(n => n.id));
  const edges = buildEdgesFromTransactions(transactions, nodeIds, MAX_EDGES_PER_NODE);

  if (edges.length === 0 && nodes.length > 1) {
    const fallbackEdges = buildEdgesFromRelations(nodes, transactions, MAX_EDGES_PER_NODE);
    edges.push(...fallbackEdges);
  }

  const maxTxCount = Math.max(...edges.map(e => e.transactions || 1), 1);
  for (const edge of edges) {
    edge.width = getEdgeWidth(edge.transactions || 1, maxTxCount);
  }

  return { nodes, edges };
}

export function buildEdgesFromTransactions(
  transactions: TransactionRecord[],
  nodeIds: Set<string>,
  maxEdgesPerNode: number = MAX_EDGES_PER_NODE
): GraphEdge[] {
  const edgeMap = new Map<string, { weight: number; transactions: number }>();

  for (const tx of transactions) {
    const from = tx.from.toLowerCase();
    const to = tx.to.toLowerCase();

    if (!nodeIds.has(from) || !nodeIds.has(to)) continue;
    if (from === to) continue;

    const edgeId = [from, to].sort().join('-');
    const existing = edgeMap.get(edgeId);

    if (existing) {
      existing.weight += parseFloat(tx.value) || 1;
      existing.transactions += 1;
    } else {
      edgeMap.set(edgeId, { weight: parseFloat(tx.value) || 1, transactions: 1 });
    }
  }

  const edges: GraphEdge[] = [];
  const edgeCountPerNode = new Map<string, number>();

  const sortedEntries = [...edgeMap.entries()].sort((a, b) => b[1].weight - a[1].weight);

  for (const [edgeId, data] of sortedEntries) {
    const [source, target] = edgeId.split('-');

    const sourceCount = edgeCountPerNode.get(source) || 0;
    const targetCount = edgeCountPerNode.get(target) || 0;

    if (sourceCount >= maxEdgesPerNode || targetCount >= maxEdgesPerNode) continue;

    edgeCountPerNode.set(source, sourceCount + 1);
    edgeCountPerNode.set(target, targetCount + 1);

    edges.push({
      id: `edge-${edgeId}`,
      source,
      target,
      weight: data.weight,
      transactions: data.transactions,
      type: 'transfer'
    });
  }

  return edges;
}

export function buildEdgesFromRelations(
  nodes: GraphNode[],
  transactions: TransactionRecord[],
  maxEdgesPerNode: number = MAX_EDGES_PER_NODE
): GraphEdge[] {
  const addresses = nodes.map(n => n.id);
  const edges: GraphEdge[] = [];
  const edgeCountPerNode = new Map<string, number>();
  const addedPairs = new Set<string>();

  for (let i = 0; i < Math.min(nodes.length, 20); i++) {
    const target = nodes[i];
    const relations = findRelatedAddresses(target.id, addresses, transactions, 1);

    for (const relation of relations.slice(0, 5)) {
      if (relation.relationStrength < MIN_RELATION_STRENGTH) continue;

      const pairId = [relation.addressA, relation.addressB].sort().join('-');
      if (addedPairs.has(pairId)) continue;

      const sourceCount = edgeCountPerNode.get(relation.addressA) || 0;
      const targetCount = edgeCountPerNode.get(relation.addressB) || 0;

      if (sourceCount >= maxEdgesPerNode || targetCount >= maxEdgesPerNode) continue;

      addedPairs.add(pairId);
      edgeCountPerNode.set(relation.addressA, sourceCount + 1);
      edgeCountPerNode.set(relation.addressB, targetCount + 1);

      edges.push({
        id: `rel-${pairId}`,
        source: relation.addressA,
        target: relation.addressB,
        weight: relation.relationStrength,
        transactions: relation.sharedTransactionCount,
        type: 'related'
      });
    }
  }

  return edges;
}

export function generateMockHolders(count: number = 20): HolderInfo[] {
  const holders: HolderInfo[] = [];

  for (let i = 0; i < count; i++) {
    const address = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const balance = String(Math.floor(Math.random() * 1000000) + 1000);
    const percentage = parseFloat((Math.random() * 30).toFixed(2));

    holders.push({
      address,
      balance,
      percentage,
      rank: i + 1,
      label: i < 3 ? `Whale ${i + 1}` : undefined
    });
  }

  holders.sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
  return holders.map((h, i) => ({ ...h, rank: i + 1 }));
}

export function generateMockTransactions(
  addresses: string[],
  count: number = 100
): TransactionRecord[] {
  const transactions: TransactionRecord[] = [];

  for (let i = 0; i < count; i++) {
    const from = addresses[Math.floor(Math.random() * addresses.length)];
    let to = addresses[Math.floor(Math.random() * addresses.length)];

    while (to === from) {
      to = addresses[Math.floor(Math.random() * addresses.length)];
    }

    transactions.push({
      from,
      to,
      value: String(Math.floor(Math.random() * 10000) + 1),
      timestamp: Date.now() - Math.floor(Math.random() * 86400000 * 30)
    });
  }

  return transactions;
}
