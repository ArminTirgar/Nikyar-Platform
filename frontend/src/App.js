import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserProvider } from './components/UserContext';
import Register from './components/Register';
import Login from './components/Login';
import AdsList from './components/AdsList';
import SearchAds from './components/SearchAds';
import Profile from './components/Profile';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import NewAd from './components/NewAd';
import FloatingHomeButton from './components/FloatingHomeButton'
import AdminDashboard from './components/AdminDashboard';

import './App.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/ads" element={<AdsList />} />
            <Route path="/search" element={<SearchAds />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new-ad" element={<NewAd />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
          <FloatingHomeButton />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
