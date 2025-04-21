// src/components/Layout.tsx
import { useState} from "react";
import Header from "./header";
import Sidebar from "./sidebar";
import Dashboard from "./dashboard";
import Students from "./students";
import Attendance from "./attendance";
import Events from "./events";

const MainPage: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);
  const [pageState, setPageState] = useState<string>("/dashboard");

  const toggleSidebar = (): void => {
    setSidebarExpanded(!sidebarExpanded);
  };



  return (
    <div className="flex flex-col min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-white shadow">
        <Header toggleSidebar={toggleSidebar} />
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
      
    </div>
  );
};

export default MainPage;
