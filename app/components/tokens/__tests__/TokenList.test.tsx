import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TokenList } from '../TokenList';
import type { BinanceAlphaToken } from '@/types';

const mockTokens: BinanceAlphaToken[] = [
  {
    alphaId: 'alpha-001',
    symbol: 'PEPE',
    name: 'Pepe',
    chainId: '1',
    chainName: 'Ethereum',
    contractAddress: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    price: '0.00001234',
    percentChange24h: '+15.42',
    volume24h: '2456789012',
    marketCap: '5234567890',
    liquidity: '890123456',
    totalSupply: '420690000000000',
    circulatingSupply: '420690000000000',
    iconUrl: 'https://cryptologos.cc/logos/pepe-pepe-logo.png',
    chainIconUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    bnExclusiveState: false,
  },
  {
    alphaId: 'alpha-002',
    symbol: 'BONK',
    name: 'Bonk',
    chainId: '56',
    chainName: 'BSC',
    contractAddress: '0xA4B5f4E4fD6b2C5E8d3F7a1B2c3D4e5F6a7B8C9D0',
    price: '0.00002856',
    percentChange24h: '-8.23',
    volume24h: '1234567890',
    marketCap: '1876543210',
    liquidity: '456789012',
    totalSupply: '93526170000000',
    circulatingSupply: '93526170000000',
    iconUrl: 'https://cryptologos.cc/logos/bonk-bonk-logo.png',
    chainIconUrl: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
    bnExclusiveState: true,
  },
  {
    alphaId: 'alpha-003',
    symbol: 'FLOKI',
    name: 'Floki Inu',
    chainId: '1',
    chainName: 'Ethereum',
    contractAddress: '0xcf0C122c6b73ff809C693DB651e98Da58e0F99D1',
    price: '0.00015678',
    percentChange24h: '+22.15',
    volume24h: '3456789012',
    marketCap: '1456789012',
    liquidity: '234567890',
    totalSupply: '9710981730000',
    circulatingSupply: '9710981730000',
    iconUrl: 'https://cryptologos.cc/logos/floki-floki-logo.png',
    chainIconUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    bnExclusiveState: false,
  },
];

describe('TokenList', () => {
  it('renders all tokens initially', () => {
    render(<TokenList tokens={mockTokens} onSelectToken={vi.fn()} />);

    expect(screen.getByText('PEPE')).toBeInTheDocument();
    expect(screen.getByText('BONK')).toBeInTheDocument();
    expect(screen.getByText('FLOKI')).toBeInTheDocument();
    expect(screen.getByText('3 tokens')).toBeInTheDocument();
  });

  it('filters tokens by search query', () => {
    render(<TokenList tokens={mockTokens} onSelectToken={vi.fn()} />);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'pepe' } });

    expect(screen.getByText('PEPE')).toBeInTheDocument();
    expect(screen.queryByText('BONK')).not.toBeInTheDocument();
    expect(screen.getByText('1 token')).toBeInTheDocument();
  });

  it('filters tokens by chain name', () => {
    render(<TokenList tokens={mockTokens} onSelectToken={vi.fn()} />);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'ethereum' } });

    expect(screen.getByText('PEPE')).toBeInTheDocument();
    expect(screen.getByText('FLOKI')).toBeInTheDocument();
    expect(screen.queryByText('BONK')).not.toBeInTheDocument();
  });

  it('shows empty state when no matches', () => {
    render(<TokenList tokens={mockTokens} onSelectToken={vi.fn()} />);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No tokens found')).toBeInTheDocument();
  });

  it('calls onSelectToken when a token is clicked', () => {
    const handleSelect = vi.fn();
    render(<TokenList tokens={mockTokens} onSelectToken={handleSelect} />);

    const items = screen.getAllByTestId('token-list-item');
    fireEvent.click(items[0]);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(mockTokens[0]);
  });

  it('shows skeleton items when loading', () => {
    render(<TokenList tokens={mockTokens} onSelectToken={vi.fn()} isLoading={true} />);

    expect(screen.getAllByTestId('skeleton-item').length).toBeGreaterThan(0);
  });

  it('sorts by market cap descending by default', () => {
    render(<TokenList tokens={mockTokens} onSelectToken={vi.fn()} />);

    const items = screen.getAllByTestId('token-list-item');
    expect(items[0]).toHaveAttribute('data-token-id', 'alpha-001');
  });

  it('toggles sort direction when clicking same sort field', () => {
    render(<TokenList tokens={mockTokens} onSelectToken={vi.fn()} />);

    const sortMarketCap = screen.getByTestId('sort-marketCap');
    fireEvent.click(sortMarketCap);

    const items = screen.getAllByTestId('token-list-item');
    expect(items[0]).toHaveAttribute('data-token-id', 'alpha-003');
  });

  it('switches sort field to volume', () => {
    render(<TokenList tokens={mockTokens} onSelectToken={vi.fn()} />);

    const sortVolume = screen.getByTestId('sort-volume24h');
    fireEvent.click(sortVolume);

    const items = screen.getAllByTestId('token-list-item');
    expect(items[0]).toHaveAttribute('data-token-id', 'alpha-003');
  });

  it('highlights selected token', () => {
    render(
      <TokenList
        tokens={mockTokens}
        selectedTokenId="alpha-002"
        onSelectToken={vi.fn()}
      />
    );

    const items = screen.getAllByTestId('token-list-item');
    expect(items[1].className).toContain('border-zinc-600');
  });
});
