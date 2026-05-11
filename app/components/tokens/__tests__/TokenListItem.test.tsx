import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TokenListItem } from '../TokenListItem';
import type { BinanceAlphaToken } from '@/types';

const mockToken: BinanceAlphaToken = {
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
};

describe('TokenListItem', () => {
  it('renders token information correctly', () => {
    render(<TokenListItem token={mockToken} />);

    expect(screen.getByText('PEPE')).toBeInTheDocument();
    expect(screen.getByText('Pepe')).toBeInTheDocument();
    expect(screen.getByText(/MCap:/)).toBeInTheDocument();
    expect(screen.getByText(/Vol:/)).toBeInTheDocument();
  });

  it('displays positive change in emerald color', () => {
    render(<TokenListItem token={mockToken} />);

    const changeEl = screen.getByText('+15.42%');
    expect(changeEl).toBeInTheDocument();
    expect(changeEl.className).toContain('text-emerald-400');
  });

  it('displays negative change in rose color', () => {
    const negativeToken = { ...mockToken, percentChange24h: '-8.23' };
    render(<TokenListItem token={negativeToken} />);

    const changeEl = screen.getByText('-8.23%');
    expect(changeEl).toBeInTheDocument();
    expect(changeEl.className).toContain('text-rose-400');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<TokenListItem token={mockToken} onClick={handleClick} />);

    fireEvent.click(screen.getByTestId('token-list-item'));
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(mockToken);
  });

  it('shows selected state styling', () => {
    const { container } = render(<TokenListItem token={mockToken} isSelected={true} />);

    const item = container.querySelector('[data-testid="token-list-item"]');
    expect(item?.className).toContain('border-zinc-600');
  });

  it('renders fallback symbol initials when no icon', () => {
    const tokenWithoutIcon = { ...mockToken, iconUrl: '' };
    const { container } = render(<TokenListItem token={tokenWithoutIcon} />);

    expect(container.textContent).toContain('PE');
  });
});
