// src/components/Layout.tsx
import { useEffect, useState } from "react";
import Header from "./header";
import Sidebar from "./sidebar";
import Dashboard from "./dashboard";
import Students from "./students";
import Attendance from "./attendance";
import Events from "./events";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4 text-yellow-500">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Confirm Logout</h3>
          <p className="text-center text-gray-600">
            Are you sure you want to logout? Any unsaved changes may be lost.
          </p>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-center space-x-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 rounded-md text-sm font-medium text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const MainPage: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);
  const [pageState, setPageState] = useState<string>("/dashboard");
  const [logoutModalOpen, setLogoutModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if(pageState === "/logout") {
      handleLogoutClick();
    }
  }, [pageState]);

  const toggleSidebar = (): void => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleLogoutClick = (): void => {
    setLogoutModalOpen(true);
  };

  const handleLogoutConfirm = (): void => {
    localStorage.removeItem('authToken');
    
  
    window.location.href = '/login';
    
    setLogoutModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-white shadow">
        <Header 
          toggleSidebar={toggleSidebar} 
        />
      </div>

      {/* Fixed Sidebar */}
      <div
        className="fixed top-[60px] left-0 h-[calc(100vh-60px)] z-40 bg-white shadow transition-all duration-300"
      >
        <Sidebar
          isExpanded={sidebarExpanded}
          onChangeState={(path) => {
            setPageState(path);
          }}
          onLogoutClick={handleLogoutClick}
        />
      </div>

      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarExpanded ? "ml-64" : "ml-16"
        } pt-[60px] p-6 bg-gray-100`}
      >
        {pageState === "/dashboard" && <Dashboard />}
        {pageState === "/students" && <Students />}
        {pageState === "/attendance" && <Attendance />}
        {pageState === "/events" && <Events />}
      </main>
      
      {/* Logout Confirmation Modal */}
      <LogoutModal 
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
};

export default MainPage;