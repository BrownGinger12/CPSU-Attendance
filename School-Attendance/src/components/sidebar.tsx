import { useState } from "react";
import { AiOutlineDashboard} from "react-icons/ai";
import { FaUsers, FaUserCheck} from "react-icons/fa";
import { BiTask } from "react-icons/bi";


interface SidebarProps {
  isExpanded: boolean;
  onChangeState: (path: string) => void;
}

interface MenuItem {
  icon: JSX.Element;
  label: string;
  path: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, onChangeState }) => {
  const menuItems: MenuItem[] = [
    {
      icon: <AiOutlineDashboard size={24} />,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <FaUsers size={24} />,
      label: "All Students",
      path: "/students",
    },
    {
      icon: <FaUserCheck size={24} />,
      label: "Present Records",
      path: "/attendance"
    },
    {
      icon: <BiTask size={24} />,
      label: "Events",
      path: "/events",
    }
  ];

  const [activeItem, setActiveItem] = useState<string>("/dashboard");

  const handleItemClick = (path: string): void => {
    setActiveItem(path);
  };

  return (
    <div
      className={`bg-gray-800 text-white h-[100vh] fixed top-[60px] left-0 transition-all duration-300 ease-in-out ${
        isExpanded ? "w-64" : "w-16"
      } overflow-hidden`}
    >
      <div className="px-4 py-6">
        <div
          className={`flex flex-col space-y-2 ${
            isExpanded ? "items-start" : "items-center"
          }`}
        >
        
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                handleItemClick(item.path);
                onChangeState(item.path);
              }}
              className={`flex items-center py-3 px-1 rounded-lg w-full transition-colors duration-200 ${
                activeItem === item.path
                  ? "bg-[#2e7d32] text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center">
                <span className={`${isExpanded ? "mr-3" : "mx-auto"}`}>
                  {item.icon}
                </span>
                <span
                  className={`whitespace-nowrap ${
                    isExpanded ? "opacity-100" : "opacity-0"
                  } transition-opacity duration-200`}
                >
                  {item.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
