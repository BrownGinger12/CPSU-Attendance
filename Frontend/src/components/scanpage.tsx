import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { firestore } from "../firebase/firebase";
import { apiClient } from "../client/AxiosClient";

interface Event {
  id: number;
  event_name: string;
  event_date: string;
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
  const user = {
    contactNo: "",
    course: "",
    firstName: "",
    id: "",
    lastName: "",
    middleName: "",
    status: "",
  };

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
      setEvents(response.data.attendance_record.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Fetch available events from Firestore
  useEffect(() => {
    fetchEvents();
  }, []);

  // Set initial date
  useEffect(() => {
    setAttDate(generateCurrentDate());
  }, []);

  // Load students whenever the selected event changes
  useEffect(() => {
    if (!selectedEvent) return;

    const unsubscribe = onSnapshot(
      collection(firestore, `Events/${selectedEvent}/Attendance`),
      (snapshot: any) => {
        const arr: any[] = [];
        snapshot.docs.forEach((doc: any) => {
          arr.push({ id: doc.id, ...doc.data() });
        });
        setStudents(arr);
      }
    );

    return () => unsubscribe();
  }, [selectedEvent]);

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

  const getCurrentTimeString = (): string => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    return `${hours}${minutes}${seconds}`;
  };

  const getCurrentTime = (): string => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleUserLog = async (): Promise<void> => {
    if (!selectedEvent) {
      alert("Please select an event first");
      return;
    }

    try {
      setLoading(true);
      const userRef = collection(
        firestore,
        `Events/${selectedEvent}/Attendance`
      );
      const userQuery = query(
        userRef,
        where("id", "==", studentData.student_id),
        where("logOut", "==", "")
      );
      const querySnapshot = await getDocs(userQuery);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, { logOut: getCurrentTime() });
        console.log("LogOut timestamp updated for current session.");
      } else {
        const customDocId = getCurrentTimeString();
        const newDocRef = doc(userRef, customDocId);
        await setDoc(newDocRef, {
          id: studentData.student_id,
          name: studentData.name,
          logIn: getCurrentTime(),
          logOut: "",
        });

        console.log("New session created for the user.");
      }
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      console.log("Enter key pressed");
      fetchUserData();
    }
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
                    <option value="">No events available</option>
                  ) : (
                    <>
                      <option value="">Select an event</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.event_date}>
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

            {/* Scan Card Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-green-800 mb-4">
                  Scan Card or Input ID
                </h2>
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Enter Student ID"
                    value={rfidUser}
                    onChange={(e) => setRfid(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    onKeyDown={handleKeyDown}
                    disabled={!selectedEvent}
                  />
                  <button
                    onClick={fetchUserData}
                    disabled={!selectedEvent || loading}
                    className={`ml-2 px-4 py-3 rounded-lg transition-colors ${
                      !selectedEvent || loading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {loading ? "Processing..." : "Scan"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {!selectedEvent
                    ? "Please select an event first"
                    : "Press Enter or click Scan to process"}
                </p>
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
                                {data.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {data.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  {data.logIn}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {data.logOut ? (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                    {data.logOut}
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
