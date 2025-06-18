import React, { useCallback, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import './EarningsChart.css';

const FUNCTIONS = process.env.REACT_APP_FUNCTIONS_BASE_URL;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

function EarningsChart() {
  const [searchParams] = useSearchParams();
  const projectName = searchParams.get("project");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [chartType, setChartType] = useState('revenue');
  const [recentPurchases, setRecentPurchases] = useState([]);

  const getDateRange = (period) => {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '7days': startDate.setDate(endDate.getDate() - 7); break;
      case '30days': startDate.setDate(endDate.getDate() - 30); break;
      case '90days': startDate.setDate(endDate.getDate() - 90); break;
      case '1year': startDate.setFullYear(endDate.getFullYear() - 1); break;
      case 'all': return { startDate: null, endDate: null };
      default: startDate.setDate(endDate.getDate() - 7);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  const fetchAnalytics = useCallback(async () => {
    if (!projectName) return;
    setLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getDateRange(selectedPeriod);
      const requestBody = {
        projectName,
        ...(startDate && endDate && { startDate, endDate })
      };

      const response = await fetch(`${FUNCTIONS}/getProjectAnalytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.success) {
        setAnalytics(result.data);
        const sorted = (result.data.purchases || [])
          .filter(p => p.status === 'completed')
          .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
          .slice(0, 10);
        setRecentPurchases(sorted);
      } else {
        setError(result.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [projectName, selectedPeriod, setLoading, setError, setAnalytics, setRecentPurchases]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const prepareChartData = () => {
    if (!analytics) return [];
    switch (chartType) {
      case 'revenue':
        return Object.entries(analytics.breakdown.revenueByCountry || {}).map(([name, value]) => ({ name, value }));
      case 'payment':
        return Object.entries(analytics.breakdown.revenueByPaymentMethod || {}).map(([name, value]) => ({ name, value }));
      case 'products':
        return Object.entries(analytics.breakdown.productRevenue || {}).map(([name, value]) => ({ name: `Product ${name}`, value }));
      default:
        return [];
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (d) => new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (!projectName) return <div className="earnings-chart"><div className="error">Please select a project to view analytics.</div></div>;

  return (
    <div className="earnings-chart">
      <div className="chart-header">
        <h2>Project Analytics</h2>
        <div className="controls">
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} disabled={loading}>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
            <option value="all">All Time</option>
          </select>
          <select value={chartType} onChange={(e) => setChartType(e.target.value)} disabled={loading}>
            <option value="revenue">Revenue by Country</option>
            <option value="payment">Revenue by Payment Method</option>
            <option value="products">Revenue by Product</option>
          </select>
        </div>
      </div>

      {loading && <div className="loading">Loading analytics...</div>}
      {error && <div className="error">{error} <button onClick={fetchAnalytics}>Retry</button></div>}

      {analytics && !loading && (
        <div className="analytics-body">
          <div className="metrics">
            <div className="card"><h4>Total Revenue</h4><p>{formatCurrency(analytics.overview.totalRevenue)}</p></div>
            <div className="card"><h4>Total Purchases</h4><p>{analytics.overview.totalPurchases}</p></div>
            <div className="card"><h4>Active Subscriptions</h4><p>{analytics.overview.activeSubscriptions}</p></div>
            <div className="card"><h4>Avg Order Value</h4><p>{formatCurrency(analytics.overview.averageOrderValue)}</p></div>
          </div>

          <div className="chart-section">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={prepareChartData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  outerRadius={120}
                  dataKey="value"
                >
                  {prepareChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="purchases">
            <h3>Recent Purchases</h3>
            {recentPurchases.length > 0 ? (
              <ul className="purchase-list">
                {recentPurchases.map((p, i) => (
                  <li key={i} className="purchase-item">
                    <div>{formatCurrency(p.amount)}</div>
                    <div>{formatDate(p.purchaseDate)}</div>
                    <div>{p.country || 'Unknown'} | {p.paymentMethod || 'Unknown'}</div>
                    <div>Product ID: {p.productId}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-purchases">No purchases found.</div>
            )}
          </div>

          <div className="range-info">
            <small>
              {analytics.dateRange.startDate && analytics.dateRange.endDate
                ? `From ${analytics.dateRange.startDate} to ${analytics.dateRange.endDate}`
                : 'All-time data'}
              {' '}({analytics.dateRange.filteredPurchases} purchases)
            </small>
          </div>
        </div>
      )}
    </div>
  );
}

export default EarningsChart;
