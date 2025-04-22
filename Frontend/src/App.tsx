// src/App.jsx
import MainPage from "./components/mainpage";
import Login from "./components/login";
import { useAuth } from "./context/AuthContext";
// Import other pages as needed

function App() {
  const { userId } = useAuth();
  return (
    <>
      {userId === null && <Login />}
      {userId && <MainPage />}
    </>
  );
}

export default App;
