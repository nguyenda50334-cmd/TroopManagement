import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, AlertCircle, Info, MessageCircle, Calendar } from "lucide-react";
import { format } from "date-fns";

const priorityConfig = {
  "Urgent": {
    color: "bg-red-100 text-red-800 border-red-300",
    icon: AlertCircle,
    borderColor: "border-l-red-500"
  },
  "Important": {
    color: "bg-amber-100 text-amber-800 border-amber-300",
    icon: Info,
    borderColor: "border-l-amber-500"
  },
  "Normal": {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: MessageCircle,
    borderColor: "border-l-blue-500"
  }
};

export default function AnnouncementCard({ announcement, onEdit, onDelete }) {
  const config = priorityConfig[announcement.priority];
  const Icon = config.icon;

  return (
    <Card className={`group border-0 border-l-4 ${config.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 bg-white`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className={`w-10 h-10 rounded-full ${config.color.replace('text', 'bg').replace('bg-', 'bg-opacity-20 bg-')} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${config.color.split(' ')[1]}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-slate-900 text-lg">
                  {announcement.title}
                </h3>
                <Badge className={`${config.color} border text-xs`}>
                  {announcement.priority}
                </Badge>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap">
                {announcement.message}
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(announcement)}
              className="hover:bg-blue-50 hover:text-blue-700"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(announcement.id)}
              className="hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-slate-600 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {announcement.target_audience}
            </Badge>
            {announcement.patrol_filter && (
              <span className="text-xs">• {announcement.patrol_filter} Patrol</span>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">
              {format(new Date(announcement.created_date), "MMM d, yyyy 'at' h:mm a")}
            </span>
          </div>

          {announcement.expires_date && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600">
                Expires: {format(new Date(announcement.expires_date), "MMM d, yyyy")}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}