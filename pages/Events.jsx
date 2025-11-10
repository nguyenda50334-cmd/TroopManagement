import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTroop } from "../context/TroopContext";

import EventCard from "../components/events/EventCard";
import EventDialog from "../components/events/EventDialog";
import AttendanceDialog from "../components/events/AttendanceDialog";

// Generic fetch function for local JSON-server
const fetchJSON = async (endpoint) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}`);
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

export default function Events() {
  const { activeTroop } = useTroop();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showDialog, setShowDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [attendanceEvent, setAttendanceEvent] = useState(null);

  const queryClient = useQueryClient();

  // Fetch events - filtered by troop
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events", activeTroop],
    queryFn: () => fetchJSON(`events?troop=${activeTroop}`),
  });

  // Mutations for creating/updating events
  const createEventMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, troop: activeTroop }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", activeTroop] });
      setShowDialog(false);
      setEditingEvent(null);
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/events`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, troop: activeTroop }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", activeTroop] });
      setShowDialog(false);
      setEditingEvent(null);
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/events`, {
        method: "DELETE",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", activeTroop] });
      // Play success sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 350;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.25);
    },
  });

  const handleSave = (data) => {
    if (editingEvent) {
      updateEventMutation.mutate({ id: editingEvent.id, data });
    } else {
      createEventMutation.mutate(data);
    }
  };

  const handleDelete = (id) => {
    deleteEventMutation.mutate(id);
  };

  const handleMarkComplete = (id) => {
    if (confirm('Mark this event as complete? It will be moved to Past Events.')) {
      const event = events.find(e => e.id === id);
      if (event) {
        // Mark event as completed - keep original dates but add completed flag
        updateEventMutation.mutate({
          id,
          data: {
            ...event,
            completed: true,
            completed_date: new Date().toISOString().split('T')[0]
          }
        });
      }
    }
  };

  const upcomingEvents = events.filter(e => {
    // If manually marked as completed, it goes to past
    if (e.completed) return false;
    
    // Parse the date string as local date (YYYY-MM-DD)
    const [year, month, day] = e.start_date.split('-').map(Number);
    const eventDate = new Date(year, month - 1, day); // month is 0-indexed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  });
  
  const pastEvents = events.filter(e => {
    // If manually marked as completed, it goes to past
    if (e.completed) return true;
    
    // Parse the date string as local date (YYYY-MM-DD)
    const [year, month, day] = e.start_date.split('-').map(Number);
    const eventDate = new Date(year, month - 1, day); // month is 0-indexed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  });
  
  const displayEvents = activeTab === "upcoming" ? upcomingEvents : pastEvents;

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Events & Activities</h1>
            <p className="text-slate-600">Manage Troop {activeTroop} calendar and attendance</p>
          </div>
          <Button
            onClick={() => {
              setEditingEvent(null);
              setShowDialog(true);
            }}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>

        {/* Custom Tabs */}
        <div className="mb-6">
          <div className="inline-flex bg-white rounded-lg shadow-md p-1">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 ${
                activeTab === "upcoming"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Upcoming ({upcomingEvents.length})
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 ${
                activeTab === "past"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Past ({pastEvents.length})
            </button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={(event) => {
                setEditingEvent(event);
                setShowDialog(true);
              }}
              onManageAttendance={setAttendanceEvent}
              onMarkComplete={activeTab === "upcoming" ? handleMarkComplete : null}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {displayEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">
              No {activeTab} events found
            </p>
            {activeTab === "upcoming" && (
              <Button
                onClick={() => setShowDialog(true)}
                variant="outline"
                className="border-purple-500 text-purple-700 hover:bg-purple-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule Your First Event
              </Button>
            )}
          </div>
        )}

        <EventDialog
          open={showDialog}
          onClose={() => {
            setShowDialog(false);
            setEditingEvent(null);
          }}
          onSave={handleSave}
          event={editingEvent}
          isLoading={createEventMutation.isPending || updateEventMutation.isPending}
        />

        <AttendanceDialog
          event={attendanceEvent}
          onClose={() => setAttendanceEvent(null)}
        />
      </div>
    </div>
  );
}