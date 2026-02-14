import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExpensesPieChart } from '../ExpensesPieChart';
import { MonthlyBarChart } from '../MonthlyBarChart';

describe('ExpensesPieChart', () => {
  it('renders empty state when no data is provided', () => {
    render(<ExpensesPieChart data={[]} />);
    expect(screen.getByText('No expense data available')).toBeInTheDocument();
  });

  it('renders the card title', () => {
    render(<ExpensesPieChart data={[]} />);
    expect(screen.getByText('Expenses by Category')).toBeInTheDocument();
  });

  it('renders chart when data is provided', () => {
    const data = [
      { name: 'Food', amount: 500 },
      { name: 'Transport', amount: 200 },
      { name: 'Leisure', amount: 300 },
    ];
    render(<ExpensesPieChart data={data} />);
    expect(screen.getByText('Expenses by Category')).toBeInTheDocument();
    // Chart should render without "No expense data available"
    expect(screen.queryByText('No expense data available')).not.toBeInTheDocument();
  });

  it('renders with default empty data prop', () => {
    render(<ExpensesPieChart />);
    expect(screen.getByText('No expense data available')).toBeInTheDocument();
  });
});

describe('MonthlyBarChart', () => {
  it('renders empty state when no data is provided', () => {
    render(<MonthlyBarChart data={[]} />);
    expect(screen.getByText('No monthly data available')).toBeInTheDocument();
  });

  it('renders the card title', () => {
    render(<MonthlyBarChart data={[]} />);
    expect(screen.getByText('Monthly Evolution')).toBeInTheDocument();
  });

  it('renders chart when data is provided', () => {
    const data = [
      { month: '2026-01', income: 5000, expense: 3000, investment: 500 },
      { month: '2026-02', income: 5500, expense: 3200, investment: 800 },
    ];
    render(<MonthlyBarChart data={data} />);
    expect(screen.getByText('Monthly Evolution')).toBeInTheDocument();
    expect(screen.queryByText('No monthly data available')).not.toBeInTheDocument();
  });

  it('renders with default empty data prop', () => {
    render(<MonthlyBarChart />);
    expect(screen.getByText('No monthly data available')).toBeInTheDocument();
  });
});
