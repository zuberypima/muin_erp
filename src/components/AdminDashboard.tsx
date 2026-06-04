import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarMenu from './SidebarMenu';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  return (
    <div className="d-flex" id="main-layout">
      <SidebarMenu />
      <div className="content flex-grow-1 p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;
