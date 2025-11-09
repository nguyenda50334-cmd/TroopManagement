import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, DollarSign, Edit, Users, CheckCircle, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useRef } from "react";

const eventTypeColors = {
  "Meeting": "from-blue-500 to-blue-700",
  "Campout": "from-green-500 to-green-700",
  "Service Project": "from-purple-500 to-purple-700",
  "Court of Honor": "from-amber-500 to-amber-700",
  "Fundraiser": "from-pink-500 to-pink-700",
  "Training": "from-indigo-500 to-indigo-700",
  "Other": "from-slate-500 to-slate-700"
};

const eventTypeBadgeColors = {
  "Meeting": "bg-blue-100 text-blue-800 border-blue-200",
  "Campout": "bg-green-100 text-green-800 border-green-200",
  "Service Project": "bg-purple-100 text-purple-800 border-purple-200",
  "Court of Honor": "bg-amber-100 text-amber-800 border-amber-200",
  "Fundraiser": "bg-pink-100 text-pink-800 border-pink-200",
  "Training": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Other": "bg-slate-100 text-slate-800 border-slate-200"
};

// Sound effect functions
const playHoverSound = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 300;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.08);
};

const playClickSound = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 400;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
};

export default function EventCard({ event, onEdit, onManageAttendance, onMarkComplete, onDelete }) {
  const cardRef = useRef(null);

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
      playClickSound();
      onDelete(event.id);
    }
  };

  return (
    <Card ref={cardRef} className="group border-0 shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden bg-white relative">
      <div className={`h-2 bg-gradient-to-r ${eventTypeColors[event.event_type]}`} />
      
      {/* Delete Button - Top Right */}
      <button
        onClick={handleDelete}
        onMouseEnter={playHoverSound}
        className="absolute top-4 right-4 p-2 rounded-full bg-white hover:bg-red-50 border-2 border-slate-200 hover:border-red-300 transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
      >
        <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
      </button>
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-slate-900 text-lg pr-2 flex-1">
            {event.title}
          </h3>
          <Badge className={`${eventTypeBadgeColors[event.event_type]} border text-xs flex-shrink-0`}>
            {event.event_type}
          </Badge>
        </div>

        {event.description && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{format(parseISO(event.start_date + 'T00:00:00'), "EEEE, MMM d, yyyy")}</span>
          </div>

          {event.end_date && event.end_date !== event.start_date && (
            <div className="flex items-center gap-2 text-sm text-slate-600 pl-6">
              <span>to {format(parseISO(event.end_date + 'T00:00:00'), "MMM d, yyyy")}</span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {event.cost > 0 && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <DollarSign className="w-4 h-4 flex-shrink-0" />
              <span>${event.cost} per scout</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <button
            onClick={() => {
              playClickSound();
              onManageAttendance(event);
            }}
            onMouseEnter={playHoverSound}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <Users className="w-4 h-4" />
            <span>Manage Attendance</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              onEdit(event);
            }}
            onMouseEnter={playHoverSound}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Event</span>
          </button>

          {onMarkComplete && (
            <button
              onClick={() => {
                playClickSound();
                onMarkComplete(event.id);
              }}
              onMouseEnter={playHoverSound}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark as Complete</span>
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}