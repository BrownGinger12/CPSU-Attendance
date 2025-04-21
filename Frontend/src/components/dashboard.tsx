import React, { useState, useEffect } from "react";
import { Users, CheckCircle, User, UserRound } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

// Define types for our stats data
interface StudentStats {
  totalStudents: number;
  presentStudents: number;
  malePresent: number;
  femalePresent: number;
  genderDistribution: {
    male: number;
    female: number;
  };
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
    presentStudents: 0,
    malePresent: 0,
    femalePresent: 0,
    genderDistribution: {
      male: 0,
      female: 0
    }
  });


  useEffect(() => {
    // This simulates an API call to fetch the data
    const fetchData = (): Promise<StudentStats> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            totalStudents: 1250,
            presentStudents: 1180,
            malePresent: 570,
            femalePresent: 610,
            genderDistribution: {
              male: 595,
              female: 630
            }
          });
        }, 1000);
      });
    };
    // Call our simulated APIs and update state
    fetchData().then((data) => {
      setStats(data);
    });
  }, []);

  // Calculate attendance percentage
  const studentAttendancePercentage: number = stats.totalStudents > 0 
    ? Math.round((stats.presentStudents / stats.totalStudents) * 100) 
    : 0;

  // Prepare data for attendance pie chart
  const prepareAttendanceData = (): PieChartData[] => [
    { name: "Present", value: stats.presentStudents },
    { name: "Absent", value: stats.totalStudents - stats.presentStudents }
  ];

  // Colors for pie chart
  const ATTENDANCE_COLORS = ['#8884d8', '#d88484'];

  return (
    <div className="bg-white p-6 rounded-lg shadow my-3">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Student Dashboard
      </h1>
      <p className="text-gray-600 mb-8">
        Student management and attendance tracking system
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Students */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <Users className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-blue-600 font-medium">Total Students</p>
            <p className="text-2xl font-bold text-blue-700">{stats.totalStudents}</p>
          </div>
        </div>

        {/* Students Present */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 flex items-center">
          <div className="bg-purple-100 p-3 rounded-full mr-4">
            <CheckCircle className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-purple-600 font-medium">Students Present</p>
            <p className="text-2xl font-bold text-purple-700">
              {stats.presentStudents} 
              <span className="text-sm font-normal ml-1">
                ({studentAttendancePercentage}%)
              </span>
            </p>
          </div>
        </div>

        {/* Male Students Present */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <User className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-green-600 font-medium">Male Students Present</p>
            <p className="text-2xl font-bold text-green-700">{stats.malePresent}</p>
          </div>
        </div>

        {/* Female Students Present */}
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex items-center">
          <div className="bg-amber-100 p-3 rounded-full mr-4">
            <UserRound className="text-amber-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-amber-600 font-medium">Female Students Present</p>
            <p className="text-2xl font-bold text-amber-700">
              {stats.femalePresent}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section - Only Attendance Chart */}
      <div className="mt-8">
        {/* Student Attendance Pie Chart */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Attendance</h2>
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
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {prepareAttendanceData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ATTENDANCE_COLORS[index % ATTENDANCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} students`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-gray-600 mt-2">
            {studentAttendancePercentage}% Attendance Rate
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;