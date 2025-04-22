// src/App.jsx
import MainPage from "./components/mainpage";
import Login from "./components/login";
import { useAuth } from "./context/AuthContext";
import React, { useState } from "react";
import ScanPage from "./components/scanpage";
// Import other pages as needed

function App() {
  const [path, setPath] = useState(window.location.pathname);
  const { userId } = useAuth();

  React.useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <>
      {path === "/" && userId === null && <Login />}
      {path === "/" && userId && <MainPage />}
      {path === "/scan" && <ScanPage />}
    </>
  );
}

export default App;
