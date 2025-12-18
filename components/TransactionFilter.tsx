import { useState, useEffect } from 'react';
import { Transaction } from '../types';

interface TransactionFilterProps {
  transactions: Transaction[];
  onFilteredTransactions: (filtered: Transaction[]) => void;
}

export default function TransactionFilter({ transactions, onFilteredTransactions }: TransactionFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Confirmed' | 'Failed'>('all');
  const [currencyFilter, setCurrencyFilter] = useState<'all' | 'BTC' | 'ETH' | 'SOL'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tx =>
        tx.senderUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.receiverUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.hash.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }

    // Currency filter
    if (currencyFilter !== 'all') {
      filtered = filtered.filter(tx => tx.currency === currencyFilter);
    }

    // Date range filter
    const now = Date.now();
    if (dateRange === 'today') {
      const todayStart = new Date().setHours(0, 0, 0, 0);
      filtered = filtered.filter(tx => tx.timestamp >= todayStart);
    } else if (dateRange === 'week') {
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter(tx => tx.timestamp >= weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter(tx => tx.timestamp >= monthAgo);
    }

    onFilteredTransactions(filtered);
  }, [searchTerm, statusFilter, currencyFilter, dateRange, transactions, onFilteredTransactions]);

  return (
    <div className="glass rounded-xl p-4 space-y-4">
      <h3 className="font-bold text-lg mb-4">🔍 Filter Transactions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/60 mb-2">Search</label>
          <input
            type="text"
            placeholder="Username or hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-700 px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-2">Status</label>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-slate-700 px-4 py-2 rounded-lg outline-none"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-2">Currency</label>
          <select
            aria-label="Filter by currency"
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value as any)}
            className="w-full bg-slate-700 px-4 py-2 rounded-lg outline-none"
          >
            <option value="all">All Currencies</option>
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="ETH">Ethereum (ETH)</option>
            <option value="SOL">Solana (SOL)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-2">Date Range</label>
          <select
            aria-label="Filter by date"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="w-full bg-slate-700 px-4 py-2 rounded-lg outline-none"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {(searchTerm || statusFilter !== 'all' || currencyFilter !== 'all' || dateRange !== 'all') && (
        <button
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setCurrencyFilter('all');
            setDateRange('all');
          }}
          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
