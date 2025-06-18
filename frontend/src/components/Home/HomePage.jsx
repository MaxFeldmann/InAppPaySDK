/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar.jsx';
import ProductList from '../../components/ProductList/ProductList.jsx';
import PurchaseList from '../../components/PurchaseList/PurchaseList.jsx';
import EarningsChart from '../../components/EarningsChart/EarningsChart.jsx';
import './HomePage.css';

function HomePage() {
  const [view, setView] = useState('products');

  return (
    <div className="home-page">
      <Sidebar onSelect={setView} />
      <div className="main-content">
        {view === 'products' && (<ProductList />)}
        {view === 'purchases' && (<PurchaseList/>)}
        {view === 'earnings' && <EarningsChart />}
      </div>
    </div>
  );
}

export default HomePage;

