import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { apiClient } from "../client/AxiosClient";

interface Event {
  id: number;
  event_name: string;
  date_start: string;
  date_end: string;
  start_time: string;
  end_time: string;
}

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<{
    event_name: string;
    date_start: string; 
    date_end: string;
    start_time: string;
    end_time: string;
  }>({
    event_name: "",
    date_start: "",
    date_end: "",
    start_time: "",
    end_time: "",
  });

  const addEvent = async (event: Event) => {
    try {
      const response = await apiClient.post("/create_record", event);
      alert("Event added successfully!");
      console.log("Event added:", response.data);
    } catch (error) {
      alert("Error adding event. Please try again.");
      console.error("Error adding event:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await apiClient.get("/attendance_records");
      setEvents(response.data.attendance_record.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = () => {
    if (newEvent.event_name && newEvent.date_start && newEvent.date_end && newEvent.start_time && newEvent.end_time) {
      const newId =
        events.length > 0
          ? Math.max(...events.map((event) => event.id)) + 1
          : 1;
      setEvents([...events, { id: newId, ...newEvent }]);
      addEvent({ id: newId, ...newEvent });
      setNewEvent({
        event_name: "",
        date_start: "",
        date_end: "",
        start_time: "",
        end_time: "",
      });
      setIsModalOpen(false);
    }
  };

  const deleteEvent = async (event_name: string) => {
    try {
      await apiClient.delete(`/attendance_record/${event_name}`);
      alert("Event deleted successfully!");
    } catch (error) {
      alert("Error deleting event. Please try again.");
      console.error("Error deleting event:", error);
    }
  };

  const handleDeleteEvent = (event_name: string) => {
    deleteEvent(event_name);
    setEvents(events.filter((event) => event.event_name !== event_name));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };


  const formatTime = (timeString: string | null) => {
    if (!timeString) return "Not checked out";
    return timeString;
  };
  

  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  return (
    <div className="container mx-auto py-6 px-1">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Event Management
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-lg transition-colors"
        >
          <FaPlus /> Add New Event
        </button>
      </div>
      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Events
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Date Start
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Date End
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Time Start
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Time End
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr
                key={event.id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="py-3 px-4">{event.event_name}</td>
                <td className="py-3 px-4">{formatDate(event.date_start)}</td>
                <td className="py-3 px-4">{formatDate(event.date_end)}</td>
                <td className="py-3 px-4">{formatTime(event.start_time)}</td>
                <td className="py-3 px-4">{formatTime(event.end_time)}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => setEventToDelete(event)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 text-center text-gray-500">
                  No events found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Add New Event
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  value={newEvent.event_name}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, event_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter event name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Start
                </label>
                <input
                  type="date"
                  value={newEvent.date_start}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, date_start: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date End
                </label>
                <input
                  type="date"
                  value={newEvent.date_end}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, date_end: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-hray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={newEvent.start_time}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, start_time: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-hray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={newEvent.end_time}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, end_time: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
              <button
                onClick={() => setIsModalOpen(false)}
                className="border border-red-500 hover:bg-red-500 text-red-500 hover:text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Modal */}
      {eventToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Confirm Deletion
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p>
                Are you sure you want to delete the event{" "}
                <span className="font-semibold">
                  {eventToDelete.event_name}
                </span>
                ?
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => setEventToDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteEvent(eventToDelete.event_name);
                  setEventToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 rounded-md text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
