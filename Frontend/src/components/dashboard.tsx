import React, { useState, useEffect } from "react";
import { Users, User, UserRound } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { apiClient } from "../client/AxiosClient";

// Define types for our stats data
interface StudentStats {
  totalStudents: number;
  maleStudent: number;
  femaleStudent: number;
}

// Type for pie chart data
interface PieChartData {
  name: string;
  value: number;
}

const Dashboard: React.FC = () => {
  // Use the defined interface for our state
  const [stats, setStats] = useState<StudentStats>({
    totalStudents: 0,
    maleStudent: 0,
    femaleStudent: 0,
  });

  const fetchStudents = async () => {
    try {
      const response = await apiClient.get("/students");

      // Assuming students data is in response.data.students.data
      const studentsData = response.data.students.data;

      // Calculate the total number of students
      const totalStudents = studentsData.length;

      // Segregate male and female students
      const maleStudents = studentsData.filter(
        (student: { gender: string }) => student.gender === "Male"
      );
      const femaleStudents = studentsData.filter(
        (student: { gender: string }) => student.gender === "Female"
      );

      // Update stats state with total, male, and female students
      setStats({
        totalStudents: totalStudents,
        maleStudent: maleStudents.length,
        femaleStudent: femaleStudents.length,
      });

      console.log("Fetched students:", studentsData);
      console.log("Total Students:", totalStudents);
      console.log("Male Students:", maleStudents.length);
      console.log("Female Students:", femaleStudents.length);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Calculate attendance percentage
  // Prepare data for attendance pie chart
  const prepareAttendanceData = (): PieChartData[] => [
    { name: "Male", value: stats.maleStudent },
    { name: "Female", value: stats.totalStudents - stats.maleStudent },
  ];

  // Colors for pie chart
  const ATTENDANCE_COLORS = ["#8884d8", "#d88484"];

  return (
    <div className="bg-white p-6 rounded-lg shadow my-3">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Student Dashboard
      </h1>
      <p className="text-gray-600 mb-8">
        Student management and attendance tracking system
      </p>

      {/* Stats Flex Layout */}
      <div className="flex justify-center mb-6">
        <div className="flex flex-wrap justify-center gap-4 w-full max-w-7xl">
          {/* Total Students */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center w-full md:flex-1 lg:flex-1">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">
                Total Students
              </p>
              <p className="text-2xl font-bold text-blue-700">
                {stats.totalStudents}
              </p>
            </div>
          </div>

          {/* Male Students Present */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex items-center w-full md:flex-1 lg:flex-1">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <User className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">
                Male Students
              </p>
              <p className="text-2xl font-bold text-green-700">
                {stats.maleStudent}
              </p>
            </div>
          </div>

          {/* Female Students Present */}
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex items-center w-full md:flex-1 lg:flex-1">
            <div className="bg-amber-100 p-3 rounded-full mr-4">
              <UserRound className="text-amber-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-amber-600 font-medium">
                Female Students
              </p>
              <p className="text-2xl font-bold text-amber-700">
                {stats.femaleStudent}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section - Only Attendance Chart */}
      <div className="mt-8">
        {/* Student Attendance Pie Chart */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={prepareAttendanceData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {prepareAttendanceData().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={ATTENDANCE_COLORS[index % ATTENDANCE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} students`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
