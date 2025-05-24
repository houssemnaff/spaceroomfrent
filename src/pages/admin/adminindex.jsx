import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { SidebarProvider } from "./componnents/sidebarcontext";
import { ThemeProvider } from "./componnents/themcontext";
import AppHeader from "./adminheader";

const AdminLayout = () => {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
          <AdminSidebar />
          <div className="flex-1 flex flex-col overflow-hidden md:ml-16 lg:ml-64">
            <AppHeader />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pt-20">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default AdminLayout;