import React, { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";


interface Event {
  id: number;
  eventName: string;
  eventDate: string;
}

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([
    { id: 1, eventName: "Conference", eventDate: "2025-05-15" },
    { id: 2, eventName: "Team Building", eventDate: "2025-06-20" },
    { id: 3, eventName: "Product Launch", eventDate: "2025-07-10" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<{
    eventName: string;
    eventDate: string;
  }>({
    eventName: "",
    eventDate: "",
  });

  const handleAddEvent = () => {
    if (newEvent.eventName && newEvent.eventDate) {
      const newId =
        events.length > 0
          ? Math.max(...events.map((event) => event.id)) + 1
          : 1;
      setEvents([...events, { id: newId, ...newEvent }]);
      setNewEvent({ eventName: "", eventDate: "" });
      setIsModalOpen(false);
    }
  };

  const handleDeleteEvent = (id: number) => {
    setEvents(events.filter((event) => event.id !== id));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
                Date of Event
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
                <td className="py-3 px-4">{event.eventName}</td>
                <td className="py-3 px-4">{formatDate(event.eventDate)}</td>
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
                  value={newEvent.eventName}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, eventName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter event name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date
                </label>
                <input
                  type="date"
                  value={newEvent.eventDate}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, eventDate: e.target.value })
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
      )};

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
          <span className="font-semibold">{eventToDelete.eventName}</span>?
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
            handleDeleteEvent(eventToDelete.id);
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
