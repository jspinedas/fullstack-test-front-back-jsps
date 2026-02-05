import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import ProductPage from './ProductPage';
import SummaryPage from './SummaryPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ProductPage />} />
      <Route path="/summary" element={<SummaryPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
