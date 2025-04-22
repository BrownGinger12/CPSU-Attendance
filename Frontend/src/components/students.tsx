import React, { useEffect, useState } from "react";
import { FaUserPlus, FaEdit, FaTrash } from "react-icons/fa";
import { apiClient } from "../client/AxiosClient";

// Define TypeScript interfaces
interface Student {
  id: number;
  student_id: string;
  name: string;
  course: string;
  section: string;
  address: string;
  birth_date: string;
  email: string;
  phone_number: number;
  gender: "Male" | "Female";
}

const Students: React.FC = () => {
  // State for modal visibility
  const [showModal, setShowModal] = useState<boolean>(false);
  // State for form data
  const [formData, setFormData] = useState<Omit<Student, "id">>({
    student_id: "",
    name: "",
    course: "",
    section: "",
    address: "",
    birth_date: "",
    email: "",
    phone_number: 0,
    gender: "Male",
  });
  // State for editing mode
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Sample student data
  const [students, setStudents] = useState<Student[]>([]);

  const fetchStudents = async () => {
    try {
      const response = await apiClient.get("/students");
      setStudents(response.data.students.data);
      console.log("Fetched students:", response.data.students.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const addStudent = async (student: Student) => {
    try {
      const response = await apiClient.post("/register", student);
      alert("Student added successfully!");
      console.log("Student added:", response.data);
    } catch (error) {
      alert("Error adding student. Please try again.");
      console.error("Error adding student:", error);
    }
  };

  const updateStudent = async (student: Student) => {
    try {
      const response = await apiClient.put("/student", student);
      alert("Student updated successfully!");
      console.log("Student updated:", response.data);
    } catch (error) {
      alert("Error updating student. Please try again.");
      console.error("Error updating student:", error);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && editId !== null) {
      // Update existing student
      setStudents(
        students.map((student) =>
          student.id === editId ? { ...formData, id: editId } : student
        )
      );

      const studentData = { ...formData, id: editId };
      updateStudent(studentData);
      setIsEditing(false);
      setEditId(null);
    } else {
      // Add new student
      const newStudent = {
        ...formData,
        id:
          students.length > 0 ? Math.max(...students.map((s) => s.id)) + 1 : 1,
      };
      console.log("New student:", newStudent);

      addStudent(newStudent);
      setStudents([...students, newStudent]);
    }

    // Reset form and close modal
    setFormData({
      name: "",
      student_id: "",
      address: "",
      course: "",
      section: "",
      birth_date: "",
      email: "",
      phone_number: 0,
      gender: "Male",
    });
    setShowModal(false);
  };

  // Handle edit student
  const handleEdit = (student: Student) => {
    setIsEditing(true);
    setEditId(student.id);
    setFormData({
      student_id: student.student_id,
      name: student.name,
      course: student.course,
      section: student.section,
      address: student.address,
      birth_date: student.birth_date,
      email: student.email,
      phone_number: student.phone_number,
      gender: student.gender,
    });
    setShowModal(true);
  };

  const deleteStudent = async (student_id: string) => {
    try {
      const response = await apiClient.delete(`/student/${student_id}`);
      alert("Student deleted successfully!");
      console.log("Student deleted:", response.data);
    } catch (error) {
      alert("Error deleting student. Please try again.");
      console.error("Error deleting student:", error);
    }
  };

  // Handle delete student
  const handleDelete = (student_id: string) => {
    deleteStudent(student_id);
    setStudents(
      students.filter((student) => student.student_id !== student_id)
    );
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredStudents =
    searchTerm.trim() === ""
      ? students
      : students.filter(
          (student) =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  return (
    <div className="container mx-auto py-6 px-1">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Student Management
      </h1>
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search..."
          className="w-full sm:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={() => {
            setIsEditing(false);
            setFormData({
              student_id: "",
              name: "",
              course: "",
              section: "",
              address: "",
              birth_date: "",
              email: "",
              phone_number: 0,
              gender: "Male",
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-lg transition-colors"
        >
          <FaUserPlus /> Add New Student
        </button>
      </div>

      {/* Student Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Section
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Birth_date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Phone#
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Gender
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {student.student_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {student.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-500">{student.course}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-500">{student.section}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-500">{student.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-500">
                      {formatDate(student.birth_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-500">{student.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-500">{student.phone_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          student.gender === "Male"
                            ? "bg-blue-100 text-blue-800"
                            : student.gender === "Female"
                            ? "bg-pink-100 text-pink-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                    >
                      {student.gender}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-indigo-600 hover:text-indigo-900 text-[20px]"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => setStudentToDelete(student)}
                        className="text-red-600 hover:text-red-900 text-[20px]"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No students found. Add a new student to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {studentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Confirm Deletion
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p>
                Are you sure you want to delete{" "}
                <span className="font-semibold">{studentToDelete.name}</span>?
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDelete(studentToDelete.student_id);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 rounded-md text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Student Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[600px] mx-4">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? "Edit Student" : "Add New Student"}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="student_id"
                >
                  Student ID
                </label>
                <input
                  disabled={isEditing}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="student_id"
                  name="student_id"
                  type="text"
                  placeholder="Enter student ID"
                  value={formData.student_id}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="name"
                >
                  Full Name
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter student name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="course"
                >
                  Course
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="course"
                  name="course"
                  type="text"
                  placeholder="Enter student course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="section"
                >
                  Section
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="section"
                  name="section"
                  type="text"
                  placeholder="Enter student section"
                  value={formData.section}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="address"
                >
                  Address
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Enter student address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="birth_date"
                >
                  Birth Date
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter student email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="phone_number"
                >
                  Phone Number
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="phone_number"
                  name="phone_number"
                  type="text"
                  placeholder="Enter student phone number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="gender"
                >
                  Gender
                </label>
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="border border-red-500 hover:bg-red-500 text-red-500 hover:text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  {isEditing ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
