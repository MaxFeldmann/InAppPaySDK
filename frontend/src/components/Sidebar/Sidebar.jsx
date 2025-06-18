import React from 'react';
import './Sidebar.css';

function Sidebar({ onSelect }) {
  return (
    <div className="sidebar">
      <h2>Dashboard</h2>
      <ul>
        <li onClick={() => onSelect('products')}>Products</li>
        <li onClick={() => onSelect('purchases')}>Purchases</li>
        <li onClick={() => onSelect('earnings')}>Earnings</li>
      </ul>
    </div>
  );
}

export default Sidebar;
