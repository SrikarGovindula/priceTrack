import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Stylesheets
import './styles/index.css';
import './styles/navbar.css';
import './styles/product.css';
import './styles/comparison.css';
import './styles/chart.css';
import './styles/dashboard.css';
import './styles/modals.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
