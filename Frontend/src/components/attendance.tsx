import React, { useState, useEffect } from "react";

interface Student {
  id: string;
  name: string;
  timeIn: string;
  timeOut: string | null;
  eventId: number;
}

interface Event {
  id: number;
  eventName: string;
}

const Attendance: React.FC = () => {
  // Sample data for events
  const [events, setEvents] = useState<Event[]>([
    { id: 1, eventName: "Conference" },
    { id: 2, eventName: "Team Building" },
    { id: 3, eventName: "Product Launch" },
  ]);

  // Sample data for students
  const [allStudents, setAllStudents] = useState<Student[]>([
    {
      id: "12345",
      name: "John Doe",
      timeIn: "08:30 AM",
      timeOut: "04:15 PM",
      eventId: 1,
    },
    {
      id: "12346",
      name: "Jane Smith",
      timeIn: "08:45 AM",
      timeOut: null,
      eventId: 1,
    },
    {
      id: "12347",
      name: "Alex Johnson",
      timeIn: "09:00 AM",
      timeOut: "03:30 PM",
      eventId: 1,
    },
    {
      id: "12348",
      name: "Sarah Williams",
      timeIn: "08:15 AM",
      timeOut: "05:00 PM",
      eventId: 2,
    },
    {
      id: "12349",
      name: "Michael Brown",
      timeIn: "09:30 AM",
      timeOut: null,
      eventId: 2,
    },
    {
      id: "12350",
      name: "Emily Davis",
      timeIn: "08:00 AM",
      timeOut: "04:00 PM",
      eventId: 3,
    },
  ]);

  // State for filtered students
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  // State for selected event
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  // Filter students when event selection changes
  useEffect(() => {
    if (selectedEventId === null) {
      setFilteredStudents(allStudents);
    } else {
      setFilteredStudents(
        allStudents.filter((student) => student.eventId === selectedEventId)
      );
    }
  }, [selectedEventId, allStudents]);

  // Handle event selection change
  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedEventId(value === "" ? null : parseInt(value));
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

        {/* Event Filter Dropdown */}
        <div className="mb-6">
          <label
            htmlFor="eventFilter"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Filter by Event:
          </label>
          <select
            id="eventFilter"
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedEventId || ""}
            onChange={handleEventChange}
          >
            <option value="">All Events</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.eventName}
              </option>
            ))}
          </select>
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
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">{student.id}</td>
                    <td className="py-3 px-4">{student.name}</td>
                    <td className="py-3 px-4">{student.timeIn}</td>
                    <td className="py-3 px-4">{formatTime(student.timeOut)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
                    No students found for the selected event
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
            <h3 className="text-sm font-medium text-yellow-700">
              Not Time Out
            </h3>
            <p className="text-2xl font-bold text-yellow-900">
              {
                filteredStudents.filter((student) => student.timeOut === null)
                  .length
              }
            </p>
          </div>
        </div>
    </div>
  );
};

export default Attendance;
