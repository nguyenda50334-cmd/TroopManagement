import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Calendar, User, Edit, Star, CheckCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useRef } from "react";

const statusColors = {
  "Not Started": "bg-slate-100 text-slate-700 border-slate-300",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-300",
  "Completed": "bg-green-100 text-green-700 border-green-300"
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

const playConfettiSound = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Create multiple oscillators for a celebratory sound
  const times = [0, 0.1, 0.2];
  const frequencies = [600, 800, 1000];
  
  times.forEach((time, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequencies[index];
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime + time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + 0.15);
    
    oscillator.start(audioContext.currentTime + time);
    oscillator.stop(audioContext.currentTime + time + 0.15);
  });
};

// Confetti particle component
const createConfetti = (cardRef) => {
  if (!cardRef.current) return;
  
  const rect = cardRef.current.getBoundingClientRect();
  const colors = ['#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa', '#fb923c'];
  const particleCount = 30;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    const size = Math.random() * 8 + 4;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    
    particle.style.cssText = `
      position: fixed;
      left: ${startX}px;
      top: ${startY}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
    `;
    
    document.body.appendChild(particle);
    
    const angle = (Math.random() * 360) * (Math.PI / 180);
    const velocity = Math.random() * 150 + 100;
    const rotation = Math.random() * 720 - 360;
    
    particle.animate([
      {
        transform: `translate(-50%, -50%) rotate(0deg)`,
        opacity: 1
      },
      {
        transform: `translate(calc(-50% + ${Math.cos(angle) * velocity}px), calc(-50% + ${Math.sin(angle) * velocity}px)) rotate(${rotation}deg)`,
        opacity: 0
      }
    ], {
      duration: 1000 + Math.random() * 500,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }).onfinish = () => {
      particle.remove();
    };
  }
};

export default function BadgeCard({ badge, scout, onEdit, onMarkComplete, onDelete }) {
  const cardRef = useRef(null);
  
  const handleMarkComplete = () => {
    playConfettiSound();
    createConfetti(cardRef);
    
    if (onMarkComplete) {
      // Delay the actual completion to let confetti play
      setTimeout(() => {
        onMarkComplete(badge.id);
      }, 100);
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to remove ${badge.badge_name} for ${scout.first_name} ${scout.last_name}?`)) {
      playClickSound();
      onDelete(badge.id);
    }
  };

  return (
    <Card ref={cardRef} className="group border-0 shadow-md hover:shadow-xl transition-all duration-500 bg-white overflow-hidden relative">
      <div className={`h-1.5 ${
        badge.status === 'Completed' ? 'bg-green-500' : 
        badge.status === 'In Progress' ? 'bg-blue-500' : 
        'bg-slate-300'
      }`} />
      
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full ${
              badge.is_eagle_required ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'
            } flex items-center justify-center shadow-md`}>
              {badge.is_eagle_required ? (
                <Star className="w-5 h-5 text-white" />
              ) : (
                <Award className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-sm truncate">
                {badge.badge_name}
              </h3>
              {badge.is_eagle_required && (
                <span className="text-xs text-amber-600 font-medium">Eagle Required</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <Badge className={`${statusColors[badge.status]} border text-xs w-full justify-center`}>
            {badge.status}
          </Badge>

          {badge.counselor_name && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <User className="w-3 h-3" />
              <span className="truncate">{badge.counselor_name}</span>
            </div>
          )}

          {badge.date_completed && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Calendar className="w-3 h-3" />
              <span>Completed {format(new Date(badge.date_completed), "MMM d, yyyy")}</span>
            </div>
          )}

          {badge.date_started && !badge.date_completed && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Calendar className="w-3 h-3" />
              <span>Started {format(new Date(badge.date_started), "MMM d, yyyy")}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => {
              playClickSound();
              onEdit(badge);
            }}
            onMouseEnter={playHoverSound}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Badge</span>
          </button>

          {badge.status === 'In Progress' && (
            <button
              onClick={handleMarkComplete}
              onMouseEnter={playHoverSound}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark Complete</span>
            </button>
          )}

          <button
            onClick={handleDelete}
            onMouseEnter={playHoverSound}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <Trash2 className="w-4 h-4" />
            <span>Remove Badge</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}