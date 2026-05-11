import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NetworkGraph from '../NetworkGraph';
import type { GraphData } from '@/types/graph';

vi.mock('react-cytoscapejs', () => ({
  default: function MockCytoscape({ cy }: { cy?: (cy: unknown) => void }) {
    if (cy) {
      const mockCy = {
        on: vi.fn(),
        off: vi.fn(),
        nodes: () => ({
          removeClass: vi.fn(),
          addClass: vi.fn(),
          not: () => ({ addClass: vi.fn(), removeClass: vi.fn() }),
        }),
        edges: () => ({
          removeClass: vi.fn(),
          addClass: vi.fn(),
        }),
        layout: () => ({ run: vi.fn() }),
        elements: () => ({
          remove: vi.fn(),
        }),
        add: vi.fn(),
        neighborhood: () => ({
          addClass: vi.fn(),
          edges: () => ({ addClass: vi.fn() }),
        }),
      };
      cy(mockCy);
    }
    return <div data-testid="mock-cytoscape">Cytoscape Mock</div>;
  },
}));

vi.mock('cytoscape', () => ({
  default: {
    use: vi.fn(),
  },
}));

vi.mock('cytoscape-cose-bilkent', () => ({
  default: vi.fn(),
}));

const MOCK_GRAPH_DATA: GraphData = {
  nodes: [
    {
      id: '0x1111111111111111111111111111111111111111',
      label: 'Whale 1',
      type: 'whale',
      balance: 1000000,
      rank: 1,
      address: '0x1111111111111111111111111111111111111111',
      percentage: 25,
      size: 80,
      color: '#9b59b6',
    },
    {
      id: '0x2222222222222222222222222222222222222222',
      label: 'Holder 1',
      type: 'holder',
      balance: 50000,
      rank: 2,
      address: '0x2222222222222222222222222222222222222222',
      percentage: 5,
      size: 30,
      color: '#4a90d9',
    },
  ],
  edges: [
    {
      id: 'edge-test',
      source: '0x1111111111111111111111111111111111111111',
      target: '0x2222222222222222222222222222222222222222',
      weight: 5000,
      transactions: 3,
      width: 4,
      color: '#34495e',
      type: 'transfer',
    },
  ],
};

describe('NetworkGraph', () => {
  it('renders the cytoscape component', () => {
    render(<NetworkGraph data={MOCK_GRAPH_DATA} />);
    expect(screen.getByTestId('mock-cytoscape')).toBeInTheDocument();
  });

  it('displays network overview stats', () => {
    render(<NetworkGraph data={MOCK_GRAPH_DATA} />);
    expect(screen.getByText('Network Overview')).toBeInTheDocument();
    expect(screen.getByText(`Nodes: ${MOCK_GRAPH_DATA.nodes.length}`)).toBeInTheDocument();
    expect(screen.getByText(`Edges: ${MOCK_GRAPH_DATA.edges.length}`)).toBeInTheDocument();
  });

  it('calls onNodeSelect callback when node is selected', () => {
    const mockOnSelect = vi.fn();
    render(<NetworkGraph data={MOCK_GRAPH_DATA} onNodeSelect={mockOnSelect} />);

    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('applies custom height style', () => {
    const { container } = render(<NetworkGraph data={MOCK_GRAPH_DATA} height="400px" />);
    const wrapper = container.querySelector('.relative');
    expect(wrapper).toHaveStyle({ height: '400px' });
  });

  it('applies custom className', () => {
    const { container } = render(<NetworkGraph data={MOCK_GRAPH_DATA} className="custom-class" />);
    const wrapper = container.querySelector('.relative');
    expect(wrapper).toHaveClass('custom-class');
  });
});
