import React, { useState, useEffect } from "react";
import { apiClient } from "../client/AxiosClient";

interface Student {
  student_id: string;
  name: string;
  login_time: string;
  logout_time: string | null;
  login_date: string;
  course: string;
}

interface Event {
  id: number;
  event_name: string;
  date_start: string;
  date_end: string;
  start_time: string;
  end_time: string;
}

const Attendance: React.FC = () => {
  const [selectedCollege, setSelectedCollege] = useState("All");
  const [events, setEvents] = useState<Event[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("All");

  const fetchEvents = async () => {
    try {
      const response = await apiClient.get("/attendance_records");
      setEvents(response.data.attendance_record.data);
      console.log("Fetched events:", response.data.attendance_record.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchAttendance = async (eventName: string) => {
    try {
      const response = await apiClient.get(
        `/attendance/${eventName.replace(" ", "_")}`
      );
      console.log("Attendance response:", response.data);
      if (response.data.attendance_records) {
        const attendanceData = response.data.attendance_records || [];
        setStudents(attendanceData);
        setFilteredStudents(attendanceData);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setStudents([]);
      setFilteredStudents([]);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getEventById = (id: number): Event | null => {
    const resp = events.find((event) => event.id === id);
    if (resp) return resp;
    return null;
  };

  // Handle event selection change
  const handleEventChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedEventId(value === "" ? null : value);
    const event = getEventById(parseInt(value));
    setSelectedEvent(event);

    if (event) {
      // Format dates for the date range
      const startDate = new Date(event.date_start);
      const endDate = new Date(event.date_end);
      const dates = getDatesInRange(startDate, endDate);
      console.log("Available dates:", dates);
      setAvailableDates(dates);
      setSelectedDate("All");
      await fetchAttendance(event.event_name);
    } else {
      setAvailableDates([]);
      setSelectedDate("All");
      setStudents([]);
      setFilteredStudents([]);
    }
  };

  const getDatesInRange = (startDate: Date, endDate: Date): string[] => {
    const dateArray: string[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      dateArray.push(`${year}-${month}-${day}`);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
  };

  const handleCollegeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setSelectedCollege(selected);

    let filtered = [...students];

    // Apply college filter
    if (selected !== "All") {
      filtered = filtered.filter((student) => {
        // Get the course from the student data
        const studentCourse = student.course || "";
        // Compare the courses (case-insensitive)
        return studentCourse.toLowerCase().includes(selected.toLowerCase());
      });
    }

    // Apply date filter
    if (selectedDate !== "All") {
      filtered = filtered.filter(
        (student) => student.login_date === selectedDate
      );
    }

    console.log("Filtered students by college:", filtered);
    setFilteredStudents(filtered);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const date = e.target.value;
    setSelectedDate(date);

    let filtered = [...students];

    // Apply college filter
    if (selectedCollege !== "All") {
      filtered = filtered.filter((student) => {
        // Get the course from the student data
        const studentCourse = student.course || "";
        // Compare the courses (case-insensitive)
        return studentCourse
          .toLowerCase()
          .includes(selectedCollege.toLowerCase());
      });
    }

    // Apply date filter
    if (date !== "All") {
      filtered = filtered.filter((student) => student.login_date === date);
    }

    console.log("Filtered students by date:", filtered);
    setFilteredStudents(filtered);
  };

  // Format the time for display
  const formatTime = (timeString: string | null) => {
    if (!timeString) return "Not checked out";
    return timeString;
  };

  return (
    <div className="container mx-auto py-6 px-1">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Student Attendance
      </h2>

      {/* Event and Department Filter Dropdowns */}
      <div className="mb-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Event Filter */}
          <div>
            <label
              htmlFor="eventFilter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select Event:
            </label>
            <select
              id="eventFilter"
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedEventId || ""}
              onChange={handleEventChange}
            >
              <option value="" disabled>
                -- Select an Event --
              </option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.event_name}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label
              htmlFor="collegeFilter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select Department:
            </label>
            <select
              id="collegeFilter"
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCollege}
              onChange={handleCollegeChange}
            >
              <option value="All">All</option>
              <option value="College of Computer Studies">
                College of Computer Studies
              </option>
              <option value="College of Hospitality Management">
                College of Hospitality Management
              </option>
              <option value="College of Agri-Business">
                College of Agri-Business
              </option>
              <option value="College of Teachers Education">
                College of Teachers Education
              </option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label
              htmlFor="dateFilter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select Date:
            </label>
            <select
              id="dateFilter"
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedDate}
              onChange={handleDateChange}
              disabled={!selectedEvent || availableDates.length === 0}
            >
              <option value="All">All</option>
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="mb-2 flex gap-4">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Date Start:{" "}
          {selectedEvent !== null ? selectedEvent?.date_start : "N/A"}
        </p>
        <p className="text-sm font-medium text-gray-700 mb-2">
          Date End: {selectedEvent !== null ? selectedEvent?.date_end : "N/A"}
        </p>
      </div>
      <div className="mb-6 flex gap-4">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Time Start:{" "}
          {selectedEvent !== null ? selectedEvent?.start_time : "N/A"}
        </p>
        <p className="text-sm font-medium text-gray-700 mb-2">
          Time End: {selectedEvent !== null ? selectedEvent?.end_time : "N/A"}
        </p>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Student ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Student Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Time In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Time Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents && filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">{student.student_id}</td>
                  <td className="py-3 px-4">{student.name}</td>
                  <td className="py-3 px-4">{student.login_time || "N/A"}</td>
                  <td className="py-3 px-4">
                    {formatTime(student.logout_time)}
                  </td>
                  <td className="py-3 px-4">{student.login_date || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500">
                  No students found for the selected filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="bg-blue-50 p-4 rounded-lg shadow-sm flex-1 min-w-[200px]">
          <h3 className="text-sm font-medium text-blue-700">Total Present</h3>
          <p className="text-2xl font-bold text-blue-900">
            {filteredStudents.length}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow-sm flex-1 min-w-[200px]">
          <h3 className="text-sm font-medium text-green-700">Time In</h3>
          <p className="text-2xl font-bold text-green-900">
            {filteredStudents.length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow-sm flex-1 min-w-[200px]">
          <h3 className="text-sm font-medium text-yellow-700">Time Out</h3>
          <p className="text-2xl font-bold text-yellow-900">
            {
              filteredStudents.filter((student) => student.logout_time !== null)
                .length
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
