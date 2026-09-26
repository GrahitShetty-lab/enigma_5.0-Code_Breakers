import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { LayoutGrid, Plus, Filter, Building2, CreditCard, Landmark, Shield, FileCheck2 } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { discoverAssets } from '../services/assetDiscovery';

const CATEGORIES = [
  'All',
  'Bank Account',
  'Life Insurance',
  'EPF',
  'Equities',
  'Mutual Funds',
  'Liability',
  'Subscription',
  'Crypto',
  'Digital Wallet',
];

const FinancialInventory = () => {
  const { assetList, totalAssets, totalLiabilities, netEstateValue } = useContext(AppContext);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discovered, setDiscovered] = useState([]);

  const handleDiscover = async () => {
    setIsDiscovering(true);
    const items = await discoverAssets();
    setDiscovered(items);
    setIsDiscovering(false);
  };



  const filteredAssets = assetList.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.accountNumberMasked &&
        item.accountNumberMasked.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Stable category-to-color mapping (preserve existing UI colors)
  const CATEGORY_COLORS = {
    'Bank Account': '#2563eb', // blue
    'Life Insurance': '#10b981', // green
    'EPF': '#f59e0b', // orange
    'Equities': '#ef4444', // red
    'Mutual Funds': '#8b5cf6', // purple
    'Liability': '#06b6d4', // cyan/teal
    'Subscription': '#d97706', // brown/orange
    'Crypto': '#ff1493', // deep pink (distinct)
    'Digital Wallet': '#00bfff', // deep sky blue (distinct)
  };

  // Compute totals per category from the filtered assets (including all categories present)
  const categoryTotalsMap = {};
  filteredAssets.forEach((a) => {
    const cat = a.category;
    categoryTotalsMap[cat] = (categoryTotalsMap[cat] || 0) + (a.value || 0);
  });
  const overviewData = Object.entries(categoryTotalsMap).map(([cat, total]) => ({
    category: cat,
    value: total,
  }));
  // Exclude zero-value categories for the donut chart
  const chartData = overviewData.filter((d) => d.value > 0);

  // Custom tooltip for the Asset Overview donut chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = chartData.reduce((sum, d) => sum + d.value, 0);
      const percent = total ? ((data.value / total) * 100).toFixed(0) : 0;
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow">
          <p className="font-medium">{data.category}</p>
          <p>₹{data.value.toLocaleString('en-IN')}</p>
          <p>{percent}%</p>
        </div>
      );
    }
    return null;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Review Required':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Claim Not Started':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Nominee Verification':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Active':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Cancellation Required':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Settled':
      case 'Cancelled':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Bank Account':
        return Landmark;
      case 'Life Insurance':
        return Shield;
      case 'Liability':
        return CreditCard;
      case 'Subscription':
        return FileCheck2;
      default:
        return Building2;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Prominent Placeholder Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-textPrimary tracking-tight">
              Financial Inventory
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              Module Preview / Placeholder
            </span>
          </div>
          <p className="text-sm text-textSecondary mt-1">
            Comprehensive ledger of estate accounts, insurance claims, retirement funds, and liabilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset Item</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-border shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-textMuted">Gross Asset Valuation</p>
          <p className="text-2xl font-bold text-textPrimary mt-1">₹{totalAssets.toLocaleString('en-IN')}</p>
          <p className="text-xs text-textSecondary mt-1">Excludes liabilities & subscriptions</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-textMuted">Outstanding Liabilities</p>
          <p className="text-2xl font-bold text-urgent mt-1">₹{totalLiabilities.toLocaleString('en-IN')}</p>
          <p className="text-xs text-textSecondary mt-1">Home loans & credit obligations</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-textMuted">Net Estate Equity</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹{netEstateValue.toLocaleString('en-IN')}</p>
          <p className="text-xs text-textSecondary mt-1">Available for lawful distribution</p>
        </div>
      </div>

      {/* Asset Overview */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-xs mb-4">
        <h2 className="text-lg font-semibold text-textPrimary mb-2">Asset Overview</h2>
                {filteredAssets.length === 0 ? (
          <p className="text-sm text-textMuted text-center">No assets to display.</p>
        ) : (
          <> {/* Asset Overview Chart */}
            <ResponsiveContainer width="100%" height={380}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  labelLine={false}
                >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#6b7280'} />
                      ))}
                </Pie>
                {/* Removed central label for single-category view */}
                <Tooltip content={CustomTooltip} />
                <Legend verticalAlign="bottom" align="center" height={40} />
              </PieChart>
            </ResponsiveContainer>
          </>
        )}

      </div>
      {/* Discovered Items */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-xs mt-4">
        <h2 className="text-lg font-semibold text-textPrimary mb-2">Discovered Items</h2>
        {isDiscovering ? (
          <div className="flex items-center justify-center py-4">
            <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          </div>
        ) : discovered.length === 0 ? (
          <p className="text-sm text-textMuted text-center py-4">No discovered items.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-subtle border-b border-border text-xs font-semibold text-textSecondary uppercase tracking-wider">
                  <th className="py-3.5 px-4">Asset Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Estimated Value</th>
                  <th className="py-3.5 px-4">Source Document</th>
                  <th className="py-3.5 px-4">Confidence</th>
                  <th className="py-3.5 px-4">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {discovered.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">{item.name}</td>
                    <td className="py-3.5 px-4">{item.category}</td>
                    <td className="py-3.5 px-4">₹{item.estimatedValue.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4">{item.sourceDocument}</td>
                    <td className="py-3.5 px-4">{item.confidence}%</td>
                    <td className="py-3.5 px-4">{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <button onClick={handleDiscover} className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/80">
          Run Asset Discovery
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by institution, type, or account mask..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3.5 pr-4 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-textPrimary placeholder:text-textMuted"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
            <Filter className="w-4 h-4 text-textMuted flex-shrink-0 mr-1" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-subtle text-textSecondary hover:text-textPrimary hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Asset Table / Cards */}
      <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-subtle border-b border-border text-xs font-semibold text-textSecondary uppercase tracking-wider">
                <th className="py-3.5 px-4">Institution & Type</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Account / Identifier</th>
                <th className="py-3.5 px-4">Nominee Details</th>
                <th className="py-3.5 px-4 text-right">Value (INR)</th>
                <th className="py-3.5 px-4">Closure Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-textMuted">
                    No financial assets found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                  const Icon = getCategoryIcon(asset.category);
                  const isLiability = asset.category === 'Liability';
                  return (
                    <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-textPrimary">{asset.institution}</p>
                            <p className="text-xs text-textSecondary">{asset.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-textSecondary border border-slate-200">
                          {asset.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-textSecondary">
                        {asset.accountNumberMasked || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <p className="font-medium text-textPrimary">{asset.nomineeName || asset.nomineeStatus}</p>
                        <p className="text-textMuted text-[11px]">{asset.nomineeStatus}</p>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`font-semibold ${isLiability ? 'text-urgent' : 'text-textPrimary'}`}>
                          {isLiability ? '-' : ''}₹{asset.value.toLocaleString('en-IN')}
                        </span>
                        {asset.billingCycle && (
                          <span className="block text-[11px] text-textMuted">/{asset.billingCycle}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
                            asset.status
                          )}`}
                        >
                          {asset.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Information Banner */}
      <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3 text-xs text-textSecondary">
        <LayoutGrid className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-textPrimary">Module Preview Notice</p>
          <p className="mt-0.5">
            Real-time Account Aggregator (RBI-licensed AA) synchronization and automatic Demat transmission (CDSL/NSDL)
            will be activated in the upcoming production release. Current values reflect verified case records.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancialInventory;
