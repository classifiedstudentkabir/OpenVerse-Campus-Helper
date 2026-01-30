/**
 * FIXED NAVIGATION COMPONENT
 * Removes Team page link (gives 404)
 * Clean navigation for demo
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/upload', label: 'Upload', icon: '📤' },
    { path: '/generate', label: 'Generate', icon: '⚡' },
    { path: '/results', label: 'Results', icon: '📋' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
    // Team page removed - was giving 404
  ];
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h1>CertifyNeo</h1>
        <p className="tagline">Bulk Certificate Generation</p>
      </div>
      
      <ul className="nav-links">
        {navItems.map(item => (
          <li key={item.path}>
            <Link 
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      
      <style jsx>{`
        .navigation {
          width: 250px;
          height: 100vh;
          background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px 0;
          position: fixed;
          left: 0;
          top: 0;
          overflow-y: auto;
        }
        
        .nav-brand {
          padding: 0 24px 24px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          margin-bottom: 24px;
        }
        
        .nav-brand h1 {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 4px 0;
        }
        
        .tagline {
          font-size: 12px;
          opacity: 0.8;
          margin: 0;
        }
        
        .nav-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .nav-links li {
          margin: 0;
        }
        
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 24px;
          color: white;
          text-decoration: none;
          transition: all 0.2s;
          border-left: 3px solid transparent;
        }
        
        .nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
          border-left-color: rgba(255, 255, 255, 0.5);
        }
        
        .nav-link.active {
          background: rgba(255, 255, 255, 0.15);
          border-left-color: white;
          font-weight: 600;
        }
        
        .nav-icon {
          font-size: 20px;
        }
        
        .nav-label {
          font-size: 15px;
        }
        
        @media (max-width: 768px) {
          .navigation {
            width: 100%;
            height: auto;
            position: relative;
          }
          
          .nav-links {
            display: flex;
            overflow-x: auto;
          }
          
          .nav-link {
            flex-direction: column;
            gap: 4px;
            padding: 12px 16px;
            text-align: center;
            min-width: 80px;
          }
          
          .nav-icon {
            font-size: 24px;
          }
          
          .nav-label {
            font-size: 12px;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navigation;
