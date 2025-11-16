import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Edit, Eye, Shield, Award, Trash2 } from "lucide-react";

const rankColors = {
  "Unranked": "bg-slate-100 text-slate-800",
  "Scout": "bg-slate-100 text-slate-800",
  "Tenderfoot": "bg-green-100 text-green-800",
  "Second Class": "bg-blue-100 text-blue-800",
  "First Class": "bg-indigo-100 text-indigo-800",
  "Star": "bg-purple-100 text-purple-800",
  "Life": "bg-red-100 text-red-800",
  "Eagle": "bg-amber-100 text-amber-800"
};

const patrolColors = {
  // Boys Troop 714 Patrols
  "Eagles": "from-amber-400 to-amber-600",
  "Buffalos": "from-red-400 to-red-600",
  "Alligators": "from-green-400 to-green-600",
  // Girls Troop 7514 Patrols
  "Hummingbirds": "from-teal-400 to-teal-600",
  "Swans": "from-pink-300 to-pink-500",
  "Flamingos": "from-rose-400 to-rose-600",
  // Shared
  "Leadership": "from-yellow-600 to-yellow-800",
  "Unassigned": "from-gray-300 to-gray-500"
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

export default function ScoutCard({ scout, onEdit, onView, onDelete }) {
  return (
    <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white">
      <div className={`h-2 bg-gradient-to-r ${patrolColors[scout.patrol] || patrolColors["Unassigned"]}`} />
      
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${patrolColors[scout.patrol] || patrolColors["Unassigned"]} flex items-center justify-center shadow-lg`}>
              <span className="text-xl font-bold text-white">
                {scout.first_name?.[0]}{scout.last_name?.[0]}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                {scout.first_name} {scout.last_name}
              </h3>
              <div className="flex gap-2 mt-1">
                <Badge className={`${rankColors[scout.rank]} text-xs flex items-center whitespace-nowrap`}>
                  <Award className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span>{scout.rank}</span>
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Patrol & Position */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Shield className="w-4 h-4" />
            <span className="font-medium">{scout.patrol} Patrol</span>
          </div>
          {scout.position && (
            <div className="text-sm text-slate-600">
              <span className="font-medium">Position:</span> {scout.position}
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4 text-sm">
          {scout.email && (
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4" />
              <span className="truncate">{scout.email}</span>
            </div>
          )}
          {scout.phone && (
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4" />
              <span>{scout.phone}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={() => {
              playClickSound();
              onView(scout);
            }}
            onMouseEnter={playHoverSound}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
          <button
            onClick={() => {
              playClickSound();
              onEdit(scout);
            }}
            onMouseEnter={playHoverSound}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => {
              playClickSound();
              if (confirm(`Are you sure you want to delete ${scout.first_name} ${scout.last_name}?`)) {
                onDelete(scout.id);
              }
            }}
            onMouseEnter={playHoverSound}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {!scout.active && (
          <div className="mt-3">
            <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300 w-full justify-center">
              Inactive
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}