import React, { useCallback, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
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
    const createAnalyticsFromPurchases = (filteredPurchases, allPurchases) => {
    const totalRevenue = filteredPurchases.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const totalPurchases = filteredPurchases.length;
    const averageOrderValue = totalPurchases > 0 ? totalRevenue / totalPurchases : 0;

    // Group by country
    const revenueByCountry = {};
    filteredPurchases.forEach(p => {
      const country = p.country || 'Unknown';
      revenueByCountry[country] = (revenueByCountry[country] || 0) + parseFloat(p.amount || 0);
    });

    // Group by payment method
    const revenueByPaymentMethod = {};
    filteredPurchases.forEach(p => {
      const method = p.paymentMethod || 'Unknown';
      revenueByPaymentMethod[method] = (revenueByPaymentMethod[method] || 0) + parseFloat(p.amount || 0);
    });

    // Group by product
    const productRevenue = {};
    filteredPurchases.forEach(p => {
      const product = p.productId || 'Unknown';
      productRevenue[product] = (productRevenue[product] || 0) + parseFloat(p.amount || 0);
    });

    return {
      overview: {
        totalRevenue,
        totalPurchases,
        activeSubscriptions: 0, // Not available from purchase data
        averageOrderValue
      },
      breakdown: {
        revenueByCountry,
        revenueByPaymentMethod,
        productRevenue
      },
      purchases: filteredPurchases,
      allPurchases: allPurchases,
      dateRange: {
        startDate: getDateRange(selectedPeriod).startDate,
        endDate: getDateRange(selectedPeriod).endDate,
        filteredPurchases: filteredPurchases.length
      }
    };
  };

    if (!projectName) return;
    setLoading(true);
    setError(null);

    try {
      // Fetch both analytics and purchases data
      const [analyticsResponse, purchasesResponse] = await Promise.all([
        fetch(`${FUNCTIONS}/getProjectAnalytics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectName }),
        }),
        fetch(`${FUNCTIONS}/getPurchases`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectName }),
        })
      ]);

      const [analyticsResult, purchasesResult] = await Promise.all([
        analyticsResponse.json(),
        purchasesResponse.json()
      ]);

      console.log('Analytics result:', analyticsResult); // Debug log
      console.log('Purchases result:', purchasesResult); // Debug log

      if (purchasesResult.success) {
        const allPurchases = purchasesResult.data || [];
        
        // Filter purchases based on selected period
        const { startDate, endDate } = getDateRange(selectedPeriod);
        let filteredPurchases = allPurchases;
        
        if (startDate && endDate) {
          filteredPurchases = allPurchases.filter(p => {
            const purchaseDate = new Date(p.purchaseDate);
            return purchaseDate >= new Date(startDate) && purchaseDate <= new Date(endDate);
          });
        }

        // Filter valid purchases and sort
        const validPurchases = filteredPurchases.filter(p => 
          p && 
          (p.status === 'completed' || p.status === 'success' || p.status === 'paid' || !p.status) && 
          p.amount > 0
        );
        
        const sorted = validPurchases
          .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
          .slice(0, 10);
        
        console.log('Filtered purchases:', sorted); // Debug log
        setRecentPurchases(sorted);

        // Create analytics data from purchases
        const analyticsData = createAnalyticsFromPurchases(filteredPurchases, allPurchases);
        
        // Merge with existing analytics if available
        if (analyticsResult.success && analyticsResult.data) {
          setAnalytics({
            ...analyticsResult.data,
            purchases: filteredPurchases,
            allPurchases: allPurchases
          });
        } else {
          setAnalytics(analyticsData);
        }
      } else {
        setError(purchasesResult.error || 'Failed to fetch purchase data');
      }
    } catch (err) {
      console.error('Fetch error:', err); // Debug log
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [projectName, selectedPeriod]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const preparePieChartData = () => {
    if (!analytics) return [];
    switch (chartType) {
      case 'revenue':
        return Object.entries(analytics.breakdown?.revenueByCountry || {}).map(([name, value]) => ({ name, value }));
      case 'payment':
        return Object.entries(analytics.breakdown?.revenueByPaymentMethod || {}).map(([name, value]) => ({ name, value }));
      case 'products':
        return Object.entries(analytics.breakdown?.productRevenue || {}).map(([name, value]) => ({ name: `Product ${name}`, value }));
      default:
        return [];
    }
  };

  const prepareDailyEarningsData = () => {
    if (!analytics || !analytics.purchases) return [];

    // Group purchases by date
    const dailyEarnings = {};
    const purchases = analytics.purchases || [];

    // Create date range based on selected period
    const { startDate, endDate } = getDateRange(selectedPeriod);
    const dateRange = [];
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayKey = d.toISOString().split('T')[0];
        dateRange.push(dayKey);
        dailyEarnings[dayKey] = 0; // Initialize with 0
      }
    }

    // Fill in actual earnings
    purchases.forEach(purchase => {
      if (!purchase || !purchase.amount || purchase.amount <= 0) return;
      
      const date = purchase.purchaseDate;
      if (!date) return;

      const dayKey = new Date(date).toISOString().split('T')[0];
      if (dailyEarnings.hasOwnProperty(dayKey)) {
        dailyEarnings[dayKey] += parseFloat(purchase.amount);
      }
    });

    // Convert to array and sort by date
    const sortedData = (dateRange.length > 0 ? dateRange : Object.keys(dailyEarnings))
      .map(date => ({
        date,
        earnings: parseFloat((dailyEarnings[date] || 0).toFixed(2)),
        formattedDate: new Date(date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return sortedData;
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  
  const formatDate = (d) => {
    if (!d) return 'Unknown date';
    return new Date(d).toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatAmount = (amount, currency = 'USD') => {
    if (!amount) return 'N/A';
    return `${parseFloat(amount).toFixed(2)}`;
  };

  const getPaymentMethodDisplay = (purchase) => {
    if (purchase.paymentMethod === 'card' && purchase.cardLastFour) {
      return `Card ending in ${purchase.cardLastFour}`;
    } else if (purchase.paymentMethod === 'paypal' && purchase.paypalEmail) {
      return `PayPal (${purchase.paypalEmail})`;
    }
    return purchase.paymentMethod || 'N/A';
  };

  if (!projectName) return <div className="earnings-chart"><div className="error">Please select a project to view analytics.</div></div>;

  const dailyEarningsData = prepareDailyEarningsData();

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
            <div className="card"><h4>Total Revenue</h4><p>{formatCurrency(analytics.overview?.totalRevenue || 0)}</p></div>
            <div className="card"><h4>Total Purchases</h4><p>{analytics.overview?.totalPurchases || 0}</p></div>
            <div className="card"><h4>Active Subscriptions</h4><p>{analytics.overview?.activeSubscriptions || 0}</p></div>
            <div className="card"><h4>Avg Order Value</h4><p>{formatCurrency(analytics.overview?.averageOrderValue || 0)}</p></div>
          </div>

          {/* Daily Earnings Line Graph */}
          <div className="chart-section">
            <h3>Earnings Over Time ({selectedPeriod.replace('days', ' Days').replace('1year', 'Past Year').replace('all', 'All Time')})</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={dailyEarningsData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="formattedDate" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={Math.max(Math.floor(dailyEarningsData.length / 10), 0)}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}`}
                  domain={[0, 'dataMax + 10']}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Daily Earnings']}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return new Date(payload[0].payload.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      });
                    }
                    return label;
                  }}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#0088FE" 
                  strokeWidth={3}
                  dot={{ fill: '#0088FE', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: '#0088FE', strokeWidth: 2, fill: '#fff' }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="graph-summary">
              <p>
                <strong>Total Period Earnings:</strong> {formatCurrency(dailyEarningsData.reduce((sum, day) => sum + day.earnings, 0))} | 
                <strong> Best Day:</strong> {dailyEarningsData.length > 0 ? formatCurrency(Math.max(...dailyEarningsData.map(d => d.earnings))) : '$0'} | 
                <strong> Average per Day:</strong> {dailyEarningsData.length > 0 ? formatCurrency(dailyEarningsData.reduce((sum, day) => sum + day.earnings, 0) / dailyEarningsData.length) : '$0'}
              </p>
            </div>
          </div>

          {/* Breakdown Pie Chart */}
          <div className="chart-section">
            <h3>{chartType === 'revenue' ? 'Revenue by Country' : chartType === 'payment' ? 'Revenue by Payment Method' : 'Revenue by Product'}</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={preparePieChartData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  outerRadius={120}
                  dataKey="value"
                >
                  {preparePieChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="purchases">
            <h3>Recent Purchases ({recentPurchases.length} found)</h3>
            {recentPurchases.length > 0 ? (
              <div className="purchases-container">
                {recentPurchases.map((purchase, i) => (
                  <div key={purchase.id || i} className="purchase-item">
                    <div className="purchase-header">
                      <h4>Product ID: {purchase.productId}</h4>
                      <span className={`status ${purchase.status || 'unknown'}`}>
                        {(purchase.status || 'UNKNOWN').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="purchase-details">
                      <div className="detail-row">
                        <span className="label">Transaction ID:</span>
                        <span className="value">{purchase.transactionId || 'N/A'}</span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="label">Amount:</span>
                        <span className="value">{formatAmount(purchase.amount, purchase.currency)}</span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="label">Type:</span>
                        <span className="value">{purchase.productType || 'N/A'}</span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="label">Payment Method:</span>
                        <span className="value">{getPaymentMethodDisplay(purchase)}</span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="label">Purchase Date:</span>
                        <span className="value">{formatDate(purchase.purchaseDate)}</span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="label">Country:</span>
                        <span className="value">{purchase.country || 'N/A'}</span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="label">User ID:</span>
                        <span className="value">{purchase.userId || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-purchases">
                No purchases found for the selected period.
                <br />
                <small>Debug: Check browser console for data structure</small>
              </div>
            )}
          </div>

          <div className="range-info">
            <small>
              {analytics.dateRange?.startDate && analytics.dateRange?.endDate
                ? `From ${analytics.dateRange.startDate} to ${analytics.dateRange.endDate}`
                : 'All-time data'}
              {' '}({analytics.dateRange?.filteredPurchases || (analytics.purchases ? analytics.purchases.length : 0)} purchases)
            </small>
          </div>
        </div>
      )}
    </div>
  );
}

export default EarningsChart;