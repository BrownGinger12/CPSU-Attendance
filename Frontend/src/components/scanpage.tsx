import { useEffect, useState } from "react";
import { apiClient } from "../client/AxiosClient";
import { io } from "socket.io-client";

interface Event {
  id: number;
  event_name: string;
  event_date: string;
  date_start: string;
  date_end: string;
  start_time: string;
  end_time: string;
  expired: boolean;
}

interface Student {
  id: number;
  student_id: string;
  name: string;
  course: string;
  section: string;
  address: string;
  birth_date: string;
  email: string;
  phone_number: string;
  gender: "Male" | "Female";
}

function ScanPage() {
  const [attDate, setAttDate] = useState("0000-00-00");
  const [students, setStudents] = useState<any[]>([]);
  const [studentData, setStudentData] = useState<Student>({
    id: 0,
    student_id: "",
    name: "",
    course: "",
    section: "",
    address: "",
    birth_date: "",
    email: "",
    phone_number: "",
    gender: "Male",
  });
  const [studentRecentData, setStudentRecentData] = useState<Student>({
    id: 0,
    student_id: "",
    name: "",
    course: "",
    section: "",
    address: "",
    birth_date: "",
    email: "",
    phone_number: "",
    gender: "Male",
  });
  const [rfidUser, setRfid] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<any>(null);

  function generateCurrentDate(): string {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const day = currentDate.getDate().toString().padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  const fetchEvents = async () => {
    try {
      const response = await apiClient.get("/attendance_records");
      // Filter out expired events
      const activeEvents = response.data.attendance_record.data.filter(
        (event: Event) => !event.expired
      );
      setEvents(activeEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Fetch available events
  useEffect(() => {
    fetchEvents();
  }, []);

  // Set initial date
  useEffect(() => {
    setAttDate(generateCurrentDate());
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Fetch initial attendance data and listen for updates when event changes
  useEffect(() => {
    if (!selectedEvent) return;
    console.log("Selected Event:", selectedEvent);

    // Fetch initial attendance data
    const fetchAttendance = async () => {
      try {
        const response = await apiClient.get(
          `/attendance/${selectedEvent.replace(" ", "_")}`
        );
        console.log("Response:", response.data);
        if (response.data.attendance_records) {
          setStudents(response.data.attendance_records);
          // Update student info with most recent scan
          if (response.data.attendance_records.length > 0) {
            const mostRecent = response.data.attendance_records[0];
            // Fetch complete student data
            const studentResponse = await apiClient.get(
              `/student/${mostRecent.student_id}`
            );
            if (studentResponse.data.student.data) {
              setStudentRecentData(studentResponse.data.student.data[0]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    fetchAttendance();

    // Set up WebSocket listener for real-time updates
    if (socket) {
      const formattedEventName = selectedEvent.replace(" ", "_");
      console.log("Joining event:", formattedEventName);
      socket.emit("join_event", formattedEventName);

      socket.on(
        `attendance_update_${formattedEventName}`,
        async (data: any) => {
          console.log("Received attendance update:", data);
          if (data.attendance_records) {
            setStudents(data.attendance_records);
            console.log("Students:", students);

            // Update student info with most recent scan
            if (data.attendance_records.length > 0) {
              const mostRecent = data.attendance_records[0];
              try {
                // Fetch complete student data
                const studentResponse = await apiClient.get(
                  `/student/${mostRecent.student_id}`
                );
                if (studentResponse.data.student.data) {
                  setStudentRecentData(studentResponse.data.student.data[0]);
                }
              } catch (error) {
                console.error("Error fetching student data:", error);
              }
            }
          }
        }
      );
    }

    return () => {
      if (socket) {
        const formattedEventName = selectedEvent.replace(" ", "_");
        socket.off(`attendance_update_${formattedEventName}`);
      }
    };
  }, [socket, selectedEvent]);

  const getUserData = async (rfidVal: string) => {
    try {
      console.log("Fetching user data for RFID:", rfidVal);
      const response = await apiClient.get(`/student/${rfidVal}`);
      setLoading(true);
      console.log("Response data:", response.data[0]);
      if (response.data.student.data) {
        setStudentData(response.data.student.data[0]);
        setRfid("");
      } else {
        setRfid("");
        alert("Student not found");
      }

      console.log("Fetched students:", response.data.student.data);
    } catch (error) {
      setRfid("");
      alert("Student not found");
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    if (!rfidUser.trim()) {
      alert("Please enter a Student ID");
      return;
    }

    getUserData(rfidUser.trim());
  };

  useEffect(() => {
    console.log("Student Data:", studentData.student_id);
    if (studentData && studentData.student_id && selectedEvent) {
      handleUserLog();
    }
  }, [studentData, selectedEvent]);

  const handleUserLog = async (): Promise<void> => {
    if (!selectedEvent) {
      alert("Please select an event first");
      return;
    }

    try {
      setLoading(true);
      const formattedEventName = selectedEvent.replace(" ", "_");
      const response = await apiClient.post(
        `/attendance/${formattedEventName}`,
        {
          student_id: studentData.student_id,
          name: studentData.name,
        }
      );

      if (response.data.statusCode === 200) {
        setStudentRecentData(studentData);
        setStudentData({
          id: 0,
          student_id: "",
          name: "",
          course: "",
          section: "",
          address: "",
          birth_date: "",
          email: "",
          phone_number: "",
          gender: "Male",
        });
      } else {
        alert("Error logging attendance");
      }
    } catch (error) {
      console.error("Error handling user log:", error);
      alert("Error logging attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEvent(e.target.value);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full bg-green-700 shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center flex-wrap">
          <h1 className="ml-4 text-white font-bold text-xl md:text-2xl">
            CPSU - Event Attendance
          </h1>
          <div className="ml-auto text-white text-sm font-medium">
            Date: {attDate}
          </div>
        </div>
      </header>

      {/* Event Selection */}
      <div className="container mx-auto px-4 py-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <h2 className="text-lg font-semibold text-green-800 mb-2 md:mb-0">
                Select Event
              </h2>
              <div className="relative w-full md:w-1/3">
                <select
                  value={selectedEvent}
                  onChange={handleEventChange}
                  className="block w-full pl-4 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-md"
                  disabled={loading || events.length === 0}
                >
                  {events.length === 0 ? (
                    <option value="">No active events available</option>
                  ) : (
                    <>
                      <option value="">Select an event</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.event_name}>
                          {event.event_name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Side - Student Information */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-green-800 mb-6">
                  Student Information
                </h2>
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-green-100">
                      <img
                        src="default.jpg"
                        className="w-full h-full object-cover"
                        alt="Student Profile"
                      />
                    </div>
                    {studentRecentData.student_id && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        ✓
                      </div>
                    )}
                  </div>

                  <div className="text-center w-full">
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {studentRecentData.student_id
                        ? studentRecentData.name
                        : "No Student Selected"}
                    </h3>

                    <div className="mt-2 text-sm text-gray-500 space-y-1">
                      {studentRecentData.student_id && (
                        <>
                          <p className="py-1 px-3 bg-green-50 rounded-full inline-block">
                            ID: {studentRecentData.student_id}
                          </p>
                          {studentRecentData.course && (
                            <p className="py-1 px-3 bg-green-50 rounded-full inline-block ml-2">
                              {studentRecentData.course}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Attendance Table */}
          <div className="w-full md:w-2/3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-green-800">
                    {selectedEvent
                      ? `${selectedEvent} Attendance`
                      : "Event Attendance"}
                  </h2>
                  <div className="text-sm text-gray-500">
                    Total: {students.length} students
                  </div>
                </div>

                {!selectedEvent ? (
                  <div className="py-8 text-center text-gray-500">
                    Please select an event to view attendance
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-green-50">
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                            Student ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                            Student Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                            Login Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                            Logout Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {students.length > 0 ? (
                          students.map((data, index) => (
                            <tr
                              key={index}
                              className={
                                index % 2 === 0 ? "bg-white" : "bg-green-50"
                              }
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {data.student_id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {data.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  {data.login_time}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {data.logout_time ? (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                    {data.logout_time}
                                  </span>
                                ) : (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                    Active
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-6 py-4 text-center text-sm text-gray-500"
                            >
                              No attendance records found for this event.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScanPage;
