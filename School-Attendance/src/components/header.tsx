// src/components/Header.tsx
import { FiAlignJustify } from "react-icons/fi";
import { BsFillPersonFill } from "react-icons/bs";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({toggleSidebar }) => {
  return (
    <div className="flex justify-between items-center bg-[#2e7d32] h-[60px] w-full py-[10px] px-[20px]">
      <button 
        className="hover:scale-105 transition-transform duration-200" 
        onClick={toggleSidebar}
      >
        <FiAlignJustify className="text-white text-[30px] cursor-pointer" />
      </button>
      
      <div className="flex gap-[10px] items-center cursor-pointer">
        <BsFillPersonFill className="text-white text-[30px]"/>
        <p className="text-white font-semibold">Admin</p>
      </div>
    </div>
  );
};

export default Header;