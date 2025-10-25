import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOpportunities, getPipelineStats } from '../../services/crmService';
import './Crm.css';

interface ForecastData {
  month: string;
  openCount: number;
  openAmount: number;
  wonCount: number;
  wonAmount: number;
  expectedRevenue: number;
}

const SalesForecast: React.FC = () => {
  const navigate = useNavigate();
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('quarterly');
  
  const organizationId = '123e4567-e89b-12d3-a456-426614174000'; // Replace with actual org ID

  useEffect(() => {
    loadForecastData();
  }, []);

  const loadForecastData = async () => {
    try {
      setLoading(true);
      const [opportunities, pipelineStats] = await Promise.all([
        getOpportunities(organizationId),
        getPipelineStats(organizationId)
      ]);
      
      setStats(pipelineStats);
      
      // Group opportunities by month
      const grouped = groupOpportunitiesByMonth(opportunities);
      setForecastData(grouped);
    } catch (error) {
      console.error('Error loading forecast data:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupOpportunitiesByMonth = (opportunities: any[]): ForecastData[] => {
    const monthMap = new Map<string, ForecastData>();

    opportunities.forEach(opp => {
      if (!opp.expectedCloseDate) return;

      const date = new Date(opp.expectedCloseDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          month: monthKey,
          openCount: 0,
          openAmount: 0,
          wonCount: 0,
          wonAmount: 0,
          expectedRevenue: 0
        });
      }

      const monthData = monthMap.get(monthKey)!;

      if (opp.status === 'OPEN') {
        monthData.openCount++;
        monthData.openAmount += opp.amount || 0;
        monthData.expectedRevenue += opp.expectedRevenue || 0;
      } else if (opp.status === 'WON') {
        monthData.wonCount++;
        monthData.wonAmount += opp.amount || 0;
      }
    });

    return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  if (loading) {
    return <div className="crm-loading">Loading forecast...</div>;
  }

  return (
    <div className="crm-container">
      <div className="crm-header">
        <h1>Sales Forecast</h1>
        <div className="crm-period-selector">
          <button
            className={`crm-btn-${selectedPeriod === 'monthly' ? 'primary' : 'secondary'}`}
            onClick={() => setSelectedPeriod('monthly')}
          >
            Monthly
          </button>
          <button
            className={`crm-btn-${selectedPeriod === 'quarterly' ? 'primary' : 'secondary'}`}
            onClick={() => setSelectedPeriod('quarterly')}
          >
            Quarterly
          </button>
          <button
            className={`crm-btn-${selectedPeriod === 'yearly' ? 'primary' : 'secondary'}`}
            onClick={() => setSelectedPeriod('yearly')}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="crm-stats-grid">
          <div className="crm-stat-card">
            <h3>Total Open Pipeline</h3>
            <p className="crm-stat-value">{stats.totalOpen || 0}</p>
            <span className="crm-stat-label">Opportunities</span>
          </div>
          <div className="crm-stat-card success">
            <h3>Total Won</h3>
            <p className="crm-stat-value">{stats.totalWon || 0}</p>
            <span className="crm-stat-label">Closed Deals</span>
          </div>
          <div className="crm-stat-card info">
            <h3>Win Rate</h3>
            <p className="crm-stat-value">{stats.winRate || 0}%</p>
            <span className="crm-stat-label">Success Rate</span>
          </div>
        </div>
      )}

      {/* Forecast Table */}
      <div className="crm-section">
        <h2>Forecast by Month</h2>
        <div className="crm-table-container">
          {forecastData.length === 0 ? (
            <div className="crm-empty-state">
              <p>No forecast data available</p>
              <button 
                className="crm-btn-primary"
                onClick={() => navigate('/crm/opportunities/new')}
              >
                Create Opportunities
              </button>
            </div>
          ) : (
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Open Count</th>
                  <th>Open Amount</th>
                  <th>Expected Revenue</th>
                  <th>Won Count</th>
                  <th>Won Amount</th>
                </tr>
              </thead>
              <tbody>
                {forecastData.map(data => (
                  <tr key={data.month}>
                    <td><strong>{formatMonth(data.month)}</strong></td>
                    <td>{data.openCount}</td>
                    <td>{formatCurrency(data.openAmount)}</td>
                    <td className="crm-forecast-expected">
                      {formatCurrency(data.expectedRevenue)}
                    </td>
                    <td>{data.wonCount}</td>
                    <td className="crm-forecast-won">
                      {formatCurrency(data.wonAmount)}
                    </td>
                  </tr>
                ))}
                <tr className="crm-table-total">
                  <td><strong>Total</strong></td>
                  <td>
                    <strong>
                      {forecastData.reduce((sum, d) => sum + d.openCount, 0)}
                    </strong>
                  </td>
                  <td>
                    <strong>
                      {formatCurrency(forecastData.reduce((sum, d) => sum + d.openAmount, 0))}
                    </strong>
                  </td>
                  <td>
                    <strong>
                      {formatCurrency(forecastData.reduce((sum, d) => sum + d.expectedRevenue, 0))}
                    </strong>
                  </td>
                  <td>
                    <strong>
                      {forecastData.reduce((sum, d) => sum + d.wonCount, 0)}
                    </strong>
                  </td>
                  <td>
                    <strong>
                      {formatCurrency(forecastData.reduce((sum, d) => sum + d.wonAmount, 0))}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesForecast;

