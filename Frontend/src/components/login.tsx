import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { setUserId } = useAuth();

  return (
    <div className="h-screen w-full bg-gray-100 flex justify-center items-center p-4">
      <div className="w-[400px] h-[400px] bg-white rounded-md shadow-xl shadow-gray-400 border p-6">
        <div className="flex justify-start items-center gap-[20px]">
          <img
            src="logo.jpg"
            alt="University Seal"
            className="w-[110px] h-[110px]"
            style={{
              clipPath: "circle(50%)",
              background: "linear-gradient(to right, #4d9542, #69a84f)",
            }}
          />
          <h1 className="flex flex-col items-center text-center">
            <span className="font-serif font-semibold text-3xl sm:text-[2rem] mb-2 sm:mb-5">
              Attendance
            </span>
            <span className="font-serif font-semibold text-3xl sm:text-[2rem]">
              System
            </span>
          </h1>
        </div>

        <form className="mt-6">
          <div className="mb-4">
            <label className="block text-sm mb-1 text-gray-800">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1 text-gray-800">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg"
            onClick={() => {
              if (username === "admin" && password === "admin") {
                setUserId("test123567");
              } else {
                alert("Invalid Credentials");
              }
            }}
          >
            Log-in
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
