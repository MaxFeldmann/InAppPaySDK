import React, { useCallback, useState, useEffect } from 'react';
import './PurchaseList.css';
import { useSearchParams } from "react-router-dom";

const FUNCTIONS = process.env.REACT_APP_FUNCTIONS_BASE_URL;

function PurchaseList({ userId, showAllPurchases = false }) {
  const [searchParams] = useSearchParams();
  const projectName = searchParams.get("project");
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const requestBody = {
        projectName: projectName
      };

      // Only add userId if we want to filter by user
      if (!showAllPurchases && userId) {
        requestBody.userId = userId;
      }

      const response = await fetch(`${FUNCTIONS}/getPurchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success) {
        setPurchases(data.data || []);
      } else {
        setError(data.error || 'Failed to fetch purchases');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [projectName, userId, showAllPurchases, setError, setLoading, setPurchases]);

   useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  const formatAmount = (amount, currency = 'USD') => {
    if (!amount) return 'N/A';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getPaymentMethodDisplay = (purchase) => {
    if (purchase.paymentMethod === 'card' && purchase.cardLastFour) {
      return `Card ending in ${purchase.cardLastFour}`;
    } else if (purchase.paymentMethod === 'paypal' && purchase.paypalEmail) {
      return `PayPal (${purchase.paypalEmail})`;
    }
    return purchase.paymentMethod || 'N/A';
  };

  if (loading) {
    return (
      <div className="purchase-list">
        <h2>Purchases</h2>
        <div className="loading">Loading purchases...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="purchase-list">
        <h2>Purchases</h2>
        <div className="error">
          Error: {error}
          <button onClick={fetchPurchases} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="purchase-list">
      <h2>Purchases {showAllPurchases ? '(All Users)' : userId ? `(User: ${userId})` : ''}</h2>
      
      {purchases.length === 0 ? (
        <div className="no-purchases">
          No purchases found.
        </div>
      ) : (
        <div className="purchases-container">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="purchase-item">
              <div className="purchase-header">
                <h3>Product ID: {purchase.productId}</h3>
                <span className={`status ${purchase.status}`}>
                  {purchase.status?.toUpperCase()}
                </span>
              </div>
              
              <div className="purchase-details">
                <div className="detail-row">
                  <span className="label">Transaction ID:</span>
                  <span className="value">{purchase.transactionId}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Amount:</span>
                  <span className="value">{formatAmount(purchase.amount, purchase.currency)}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Type:</span>
                  <span className="value">{purchase.productType}</span>
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
                
                {showAllPurchases && (
                  <div className="detail-row">
                    <span className="label">User ID:</span>
                    <span className="value">{purchase.userId}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <button onClick={fetchPurchases} className="refresh-button">
        Refresh
      </button>
    </div>
  );
}

export default PurchaseList;
