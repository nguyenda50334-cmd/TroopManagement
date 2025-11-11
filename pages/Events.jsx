import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTroop } from "../context/TroopContext";

import EventCard from "../components/events/EventCard";
import EventDialog from "../components/events/EventDialog";
import AttendanceDialog from "../components/events/AttendanceDialog";

const JSONBIN_BASE_URL = `https://api.jsonbin.io/v3/b/${import.meta.env.VITE_JSONBIN_ID}`;

const fetchJSONBin = async (method = "GET", data) => {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": import.meta.env.VITE_JSONBIN_KEY,
    },
  };
  if (data) options.body = JSON.stringify(data);

  const res = await fetch(JSONBIN_BASE_URL, options);
  if (!res.ok) throw new Error(`Jsonbin request failed: ${res.status}`);
  const json = await res.json();
  return json.record;
};

export default function Events() {
  const { activeTroop } = useTroop();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showDialog, setShowDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [attendanceEvent, setAttendanceEvent] = useState(null);

  const queryClient = useQueryClient();

  // Reset tab/dialogs when troop changes
  useEffect(() => {
    setActiveTab("upcoming");
    setShowDialog(false);
    setEditingEvent(null);
    setAttendanceEvent(null);
  }, [activeTroop]);

  // Fetch all events
  const { data: allEvents = [], isLoading } = useQuery({
    queryKey: ["events", activeTroop],
    queryFn: async () => {
      const binData = await fetchJSONBin();
      return binData.events || [];
    },
  });

  // Filter events by active troop
  const events = allEvents.filter(e => e.troop === activeTroop);

  console.log("Events page - activeTroop:", activeTroop);
  console.log("Events page - all events:", allEvents);
  console.log("Events page - filtered events:", events);

  // Helper to fetch entire bin for mutations
  const fetchBinData = async () => await fetchJSONBin();

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (newEvent) => {
      const binData = await fetchBinData();
      const updatedEvents = [...(binData.events || []), { ...newEvent, troop: activeTroop }];
      return fetchJSONBin("PUT", { ...binData, events: updatedEvents });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setShowDialog(false);
      setEditingEvent(null);
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const binData = await fetchBinData();
      const updatedEvents = (binData.events || []).map(e => (e.id === id ? { ...e, ...data } : e));
      return fetchJSONBin("PUT", { ...binData, events: updatedEvents });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setShowDialog(false);
      setEditingEvent(null);
    },
  });

  // Delete event mutation with sound effect
  const deleteEventMutation = useMutation({
    mutationFn: async (id) => {
      console.log("Deleting event:", id);
      const binData = await fetchBinData();
      const updatedEvents = (binData.events || []).filter(e => e.id !== id);
      return fetchJSONBin("PUT", { ...binData, events: updatedEvents });
    },
    onSuccess: () => {
      console.log("Event deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["events"] });

      // Play success sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 350;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.25);
    },
    onError: (error) => {
      console.error("Error deleting event:", error);
      alert("Failed to delete event. Please try again.");
    },
  });

  const handleSave = (data) => {
    if (editingEvent) {
      updateEventMutation.mutate({ id: editingEvent.id, data });
    } else {
      createEventMutation.mutate({ ...data, id: `event-${Date.now()}` });
    }
  };

  const handleDelete = (id) => deleteEventMutation.mutate(id);

  const handleMarkComplete = (id) => {
    if (confirm("Mark this event as complete? It will be moved to Past Events.")) {
      const event = events.find(e => e.id === id);
      if (event) {
        updateEventMutation.mutate({
          id,
          data: {
            ...event,
            completed: true,
            completed_date: new Date().toISOString().split("T")[0],
          },
        });
      }
    }
  };

  // Separate upcoming vs past
  const upcomingEvents = events.filter(e => {
    if (e.completed) return false;
    if (!e.start_date) return true;
    const [year, month, day] = e.start_date.split("-").map(Number);
    const eventDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  });

  const pastEvents = events.filter(e => {
    if (e.completed) return true;
    if (!e.start_date) return false;
    const [year, month, day] = e.start_date.split("-").map(Number);
    const eventDate = new Date(year, month - 1, day);
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
            onClick={() => { setEditingEvent(null); setShowDialog(true); }}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Event
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="inline-flex bg-white rounded-lg shadow-md p-1">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 ${
                activeTab === "upcoming" ? "bg-purple-600 text-white shadow-md" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Upcoming ({upcomingEvents.length})
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 ${
                activeTab === "past" ? "bg-purple-600 text-white shadow-md" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
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
              onEdit={(e) => { setEditingEvent(e); setShowDialog(true); }}
              onManageAttendance={setAttendanceEvent}
              onMarkComplete={activeTab === "upcoming" ? handleMarkComplete : null}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {displayEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">No {activeTab} events found for Troop {activeTroop}</p>
            {activeTab === "upcoming" && (
              <Button
                onClick={() => setShowDialog(true)}
                variant="outline"
                className="border-purple-500 text-purple-700 hover:bg-purple-50"
              >
                <Plus className="w-4 h-4 mr-2" /> Schedule Your First Event
              </Button>
            )}
          </div>
        )}

        <EventDialog
          open={showDialog}
          onClose={() => { setShowDialog(false); setEditingEvent(null); }}
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
