import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, DollarSign } from "lucide-react";
import { format, isFuture } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const eventTypeColors = {
  "Meeting": "bg-blue-100 text-blue-800 border-blue-200",
  "Campout": "bg-green-100 text-green-800 border-green-200",
  "Service Project": "bg-purple-100 text-purple-800 border-purple-200",
  "Court of Honor": "bg-amber-100 text-amber-800 border-amber-200",
  "Fundraiser": "bg-pink-100 text-pink-800 border-pink-200",
  "Training": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Other": "bg-slate-100 text-slate-800 border-slate-200"
};

export default function UpcomingEvents({ events, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  const upcomingEvents = events
    .filter(e => isFuture(new Date(e.start_date)))
    .slice(0, 4);

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader className="border-b border-slate-100">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-slate-900">Upcoming Events</CardTitle>
          <Link to={createPageUrl("Events")} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="group p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-300 bg-slate-50 hover:bg-white">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {event.title}
                </h3>
                <Badge className={`${eventTypeColors[event.event_type]} border text-xs`}>
                  {event.event_type}
                </Badge>
              </div>
              
              <div className="space-y-1 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(event.start_date), "MMM d, yyyy")}</span>
                </div>
                
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                )}
                
                {event.cost > 0 && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>${event.cost} per scout</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {upcomingEvents.length === 0 && (
            <p className="text-center text-slate-500 py-8">No upcoming events scheduled</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}