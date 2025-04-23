import React, { useState, useEffect } from "react";
import { apiClient } from "../client/AxiosClient";
import { collection, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import Students from "./students";

interface Student {
  id: string;
  name: string;
  logIn: string;
  logOut: string | null;
  course: string;
}

interface Event {
  id: number;
  event_name: string;
  event_date: string;
}

const Attendance: React.FC = () => {
  const [selectedCollege, setSelectedCollege] = useState("");
  const [events, setEvents] = useState<Event[]>([]);

  // Sample data for students
  const [allStudents, setAllStudents] = useState<Student[]>([]);

  // State for filtered students
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  // State for selected event
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const response = await apiClient.get("/attendance_records");
      setEvents(response.data.attendance_record.data);
      console.log("Fetched events:", response.data.attendance_record.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);
  // Filter students when event selection changes

  // Handle event selection change
  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedEventId(value === "" ? null : value);
  };

  useEffect(() => {
    if (!selectedEventId) return;

    const unsubscribe = onSnapshot(
      collection(firestore, `Events/${selectedEventId}/Attendance`),
      (snapshot: any) => {
        const arr: any[] = [];
        snapshot.docs.forEach((doc: any) => {
          arr.push({ id: doc.id, ...doc.data() });
        });
        console.log("Fetched students:", arr);
        setAllStudents(arr);
        setFilteredStudents(arr);
      }
    );

    return () => unsubscribe();
  }, [selectedEventId]);

  const handleCollegeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setSelectedCollege(selected);

    if (selected === "All") {
      setFilteredStudents(allStudents);
    } else {
      const filtered = allStudents.filter(
        (student: Student) =>
          student.course.trim().toLowerCase() === selected.trim().toLowerCase()
      );
      setFilteredStudents(filtered);
    }
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
      <div className="mb-6">
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
                <option key={event.id} value={event.event_date}>
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
        </div>
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
                  <td className="py-3 px-4">{student.logIn}</td>
                  <td className="py-3 px-4">{formatTime(student.logOut)}</td>
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
            {allStudents.length}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow-sm flex-1 min-w-[200px]">
          <h3 className="text-sm font-medium text-green-700">Time In</h3>
          <p className="text-2xl font-bold text-green-900">
            {allStudents.length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow-sm flex-1 min-w-[200px]">
          <h3 className="text-sm font-medium text-yellow-700">Time Out</h3>
          <p className="text-2xl font-bold text-yellow-900">
            {allStudents.filter((student) => student.logOut !== "").length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
