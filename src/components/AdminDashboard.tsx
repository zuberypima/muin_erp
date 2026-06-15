import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SidebarMenu from './SidebarMenu';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="d-flex" id="main-layout">
      {/* Mobile Top Navbar */}
      <div className="d-md-none bg-white p-3 d-flex justify-content-between align-items-center border-bottom shadow-sm z-3 w-100" style={{ position: 'fixed', top: 0, height: '70px' }}>
        <div className="d-flex align-items-center">
          <div className="me-2" style={{ width: '32px', height: '32px', background: 'var(--primary-green)', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fas fa-leaf"></i>
          </div>
          <span className="fs-5 fw-bold text-dark mb-0 lh-1">MUIN <span className="text-primary-green">Ltd</span></span>
        </div>
        <button className="btn btn-light border-0 shadow-none" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <i className="fas fa-bars fs-4 text-dark"></i>
        </button>
      </div>

      <SidebarMenu isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="content flex-grow-1 p-4 mobile-content-padding">
        <Outlet />
      </div>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="sidebar-backdrop d-md-none"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminDashboard;
