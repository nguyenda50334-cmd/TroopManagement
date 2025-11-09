import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, Shield, Award, User, Heart, X } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

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

export default function ScoutDetailDialog({ scout, onClose }) {
  // Fetch merit badges from json-server
  const { data: badges = [] } = useQuery({
    queryKey: ['scoutBadges', scout?.id],
    queryFn: () => 
      fetch(`http://localhost:5000/meritBadges?scout_id=${scout.id}`)
        .then(res => res.json()),
    enabled: !!scout,
  });

  // Fetch attendance records from json-server
  const { data: attendance = [] } = useQuery({
    queryKey: ['scoutAttendance', scout?.id],
    queryFn: () => 
      fetch(`http://localhost:5000/attendance?scout_id=${scout.id}`)
        .then(res => res.json()),
    enabled: !!scout,
  });

  if (!scout) return null;

  const completedBadges = badges.filter(b => b.status === 'Completed').length;
  const inProgressBadges = badges.filter(b => b.status === 'In Progress').length;
  
  // Calculate attendance rate: Present + Late count as present
  const presentCount = attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  return (
    <Dialog open={!!scout} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Scout Profile</DialogTitle>
            <button
              onClick={onClose}
              className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-3xl font-bold">
                  {scout.first_name?.[0]}{scout.last_name?.[0]}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{scout.first_name} {scout.last_name}</h2>
                <div className="flex gap-2 mt-2">
                  <Badge className="bg-white/20 text-white border-white/30">
                    {scout.patrol} Patrol
                  </Badge>
                  {scout.position && (
                    <Badge className="bg-white/20 text-white border-white/30">
                      {scout.position}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold">{completedBadges}</div>
                <div className="text-sm text-white/80">Merit Badges</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold">{attendanceRate}%</div>
                <div className="text-sm text-white/80">Attendance</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold">{inProgressBadges}</div>
                <div className="text-sm text-white/80">In Progress</div>
              </div>
            </div>
          </div>

          {/* Rank Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-slate-900">Current Rank</span>
              </div>
              <Badge className={`${rankColors[scout.rank]} text-base px-3 py-1`}>
                {scout.rank}
              </Badge>
            </div>

            {scout.join_date && (
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-slate-900">Join Date</span>
                </div>
                <p className="text-slate-700">{format(new Date(scout.join_date), "MMMM d, yyyy")}</p>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-slate-900 border-b pb-2">Contact Information</h3>
            <div className="grid gap-3">
              {scout.email && (
                <div className="flex items-center gap-3 text-slate-700">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span>{scout.email}</span>
                </div>
              )}
              {scout.phone && (
                <div className="flex items-center gap-3 text-slate-700">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span>{scout.phone}</span>
                </div>
              )}
              {scout.date_of_birth && (
                <div className="flex items-center gap-3 text-slate-700">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Born {format(new Date(scout.date_of_birth), "MMMM d, yyyy")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Parent/Guardian Information */}
          {scout.parent_name && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-slate-900 border-b pb-2">Parent/Guardian</h3>
              <div className="grid gap-3">
                <div className="flex items-center gap-3 text-slate-700">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>{scout.parent_name}</span>
                </div>
                {scout.parent_email && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span>{scout.parent_email}</span>
                  </div>
                )}
                {scout.parent_phone && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span>{scout.parent_phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Medical Notes */}
          {scout.medical_notes && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-slate-900 border-b pb-2">Medical Information</h3>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-red-600 mt-0.5" />
                  <p className="text-slate-700">{scout.medical_notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}