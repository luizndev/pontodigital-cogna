import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './App.jsx'; 
import Login from './Acesso/Acesso.jsx'; 
import Painel from './Painel/Painel.jsx';
import Admin from './Admin/Admin.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/acesso" element={<Login />} />
        <Route path="/painel" element={<Painel />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
