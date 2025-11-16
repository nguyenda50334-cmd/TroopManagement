import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle, AlertCircle, Clock, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useTroop } from "../../context/TroopContext";

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

const statusConfig = {
  "Present": {
    icon: CheckCircle2,
    activeClass: "bg-green-600 text-white shadow-md hover:bg-green-700",
    inactiveClass: "bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100"
  },
  "Absent": {
    icon: XCircle,
    activeClass: "bg-red-600 text-white shadow-md hover:bg-red-700",
    inactiveClass: "bg-red-50 text-red-700 border-2 border-red-200 hover:bg-red-100"
  },
  "Excused": {
    icon: AlertCircle,
    activeClass: "bg-blue-600 text-white shadow-md hover:bg-blue-700",
    inactiveClass: "bg-blue-50 text-blue-700 border-2 border-blue-200 hover:bg-blue-100"
  },
  "Late": {
    icon: Clock,
    activeClass: "bg-amber-600 text-white shadow-md hover:bg-amber-700",
    inactiveClass: "bg-amber-50 text-amber-700 border-2 border-amber-200 hover:bg-amber-100"
  }
};

export default function AttendanceDialog({ event, onClose }) {
  const { activeTroop } = useTroop();
  const queryClient = useQueryClient();

  console.log('AttendanceDialog - activeTroop:', activeTroop);
  console.log('AttendanceDialog - event:', event);

  // Fetch scouts from JSONBin
  const { data: allScouts = [] } = useQuery({
    queryKey: ['scouts', activeTroop],
    queryFn: async () => {
      const binData = await fetchJSONBin();
      console.log('Fetched bin data:', binData);
      return binData.scouts || [];
    },
    enabled: !!event,
  });

  console.log('AttendanceDialog - all scouts from JSONBin:', allScouts);

  // Filter scouts by active troop and active status
  const troopScouts = allScouts.filter(s => s.troop === activeTroop && s.active);
  
  console.log('AttendanceDialog - troopScouts (filtered):', troopScouts);

  // Fetch attendance records from JSONBin
  const { data: allAttendance = [] } = useQuery({
    queryKey: ['attendance', event?.id],
    queryFn: async () => {
      const binData = await fetchJSONBin();
      console.log('Fetched attendance from bin:', binData.attendance);
      return binData.attendance || [];
    },
    enabled: !!event,
  });

  // Filter attendance for this specific event
  const attendance = allAttendance.filter(a => a.event_id === event?.id);
  console.log('Attendance for this event:', attendance);

  // Helper to fetch entire bin for mutations
  const fetchBinData = async () => await fetchJSONBin();

  // Create attendance record
  const createAttendanceMutation = useMutation({
    mutationFn: async (newAttendance) => {
      console.log('Creating attendance with data:', newAttendance);
      const binData = await fetchBinData();
      const updatedAttendance = [...(binData.attendance || []), { 
        ...newAttendance, 
        id: `attendance-${Date.now()}`
      }];
      return fetchJSONBin("PUT", { ...binData, attendance: updatedAttendance });
    },
    onSuccess: (data) => {
      console.log('Created attendance successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['attendance', event?.id] });
    },
    onError: (error) => {
      console.error('Error creating attendance:', error);
      alert('Failed to create attendance record. Please try again.');
    }
  });

  // Update attendance record
  const updateAttendanceMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      console.log('Updating attendance:', id, 'with data:', data);
      const binData = await fetchBinData();
      const updatedAttendance = (binData.attendance || []).map(a => 
        a.id === id ? { ...a, ...data } : a
      );
      return fetchJSONBin("PUT", { ...binData, attendance: updatedAttendance });
    },
    onSuccess: (data) => {
      console.log('Updated attendance successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['attendance', event?.id] });
    },
    onError: (error) => {
      console.error('Error updating attendance:', error);
      alert('Failed to update attendance record. Please try again.');
    }
  });

  const handleStatusChange = (scout, newStatus) => {
    console.log('Changing status for scout:', scout.id, 'to:', newStatus);
    const existingAttendance = attendance.find(a => a.scout_id === scout.id);
    console.log('Existing attendance:', existingAttendance);
    
    if (existingAttendance) {
      // Update existing record
      updateAttendanceMutation.mutate({
        id: existingAttendance.id,
        data: { 
          scout_id: scout.id,
          event_id: event.id,
          status: newStatus 
        }
      });
    } else {
      // Create new attendance record
      console.log('Creating new attendance record');
      createAttendanceMutation.mutate({
        scout_id: scout.id,
        event_id: event.id,
        status: newStatus
      });
    }
  };

  if (!event) return null;

  // Calculate statistics using troopScouts
  const presentCount = attendance.filter(a => {
    const scout = troopScouts.find(s => s.id === a.scout_id);
    return scout && a.status === 'Present';
  }).length;
  
  const lateCount = attendance.filter(a => {
    const scout = troopScouts.find(s => s.id === a.scout_id);
    return scout && a.status === 'Late';
  }).length;
  
  const absentCount = attendance.filter(a => {
    const scout = troopScouts.find(s => s.id === a.scout_id);
    return scout && a.status === 'Absent';
  }).length;
  
  const excusedCount = attendance.filter(a => {
    const scout = troopScouts.find(s => s.id === a.scout_id);
    return scout && a.status === 'Excused';
  }).length;
  
  // Attendance rate: (Present + Late) / Total * 100
  const effectivePresent = presentCount + lateCount;
  const attendanceRate = troopScouts.length > 0 ? Math.round((effectivePresent / troopScouts.length) * 100) : 0;

  return (
    <Dialog open={!!event} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-8">
              <DialogTitle className="text-2xl font-bold">Event Attendance</DialogTitle>
              <div className="text-sm text-slate-600 mt-2">
                {event.title} - {format(parseISO(event.start_date + 'T00:00:00'), "MMMM d, yyyy")}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Troop {activeTroop}
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
        </DialogHeader>

        {/* Summary */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="text-2xl font-bold">{troopScouts.length}</div>
              <div className="text-sm text-white/80">Total Scouts</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{presentCount}</div>
              <div className="text-sm text-white/80">Present</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{lateCount}</div>
              <div className="text-sm text-white/80">Late</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{absentCount + excusedCount}</div>
              <div className="text-sm text-white/80">Absent</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{attendanceRate}%</div>
              <div className="text-sm text-white/80">Attendance Rate</div>
            </div>
          </div>
        </div>

        {/* Scout List */}
        <div className="space-y-3">
          {troopScouts.map((scout) => {
            const scoutAttendance = attendance.find(a => a.scout_id === scout.id);
            const currentStatus = scoutAttendance?.status || null;

            return (
              <div key={scout.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {scout.first_name?.[0]}{scout.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">
                      {scout.first_name} {scout.last_name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {scout.patrol} Patrol · {scout.rank}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {["Present", "Late", "Absent", "Excused"].map((status) => {
                    const config = statusConfig[status];
                    const Icon = config.icon;
                    const isActive = currentStatus === status;
                    
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(scout, status)}
                        disabled={createAttendanceMutation.isPending || updateAttendanceMutation.isPending}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isActive ? config.activeClass : config.inactiveClass
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{status}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {troopScouts.length === 0 && (
            <p className="text-center text-slate-500 py-8">
              No active scouts found for Troop {activeTroop}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}