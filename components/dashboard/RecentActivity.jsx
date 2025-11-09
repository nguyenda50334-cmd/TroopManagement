import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Award, TrendingUp, Users } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecentActivity() {
  const { data: badges = [], isLoading: badgesLoading } = useQuery({
    queryKey: ['recentBadges'],
    queryFn: () => base44.entities.MeritBadge.filter({ status: 'Completed' }, '-date_completed', 5),
  });

  const { data: scouts = [], isLoading: scoutsLoading } = useQuery({
    queryKey: ['scouts'],
    queryFn: () => base44.entities.Scout.list('-created_date', 5),
  });

  if (badgesLoading || scoutsLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-slate-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {badges.slice(0, 3).map((badge) => (
            <div key={badge.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
                <Award className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">Merit Badge Earned</p>
                <p className="text-xs text-slate-600 truncate">{badge.badge_name}</p>
                {badge.date_completed && (
                  <p className="text-xs text-slate-400 mt-1">
                    {format(new Date(badge.date_completed), "MMM d")}
                  </p>
                )}
              </div>
            </div>
          ))}
          
          {scouts.slice(0, 2).map((scout) => (
            <div key={scout.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">New Scout</p>
                <p className="text-xs text-slate-600 truncate">
                  {scout.first_name} {scout.last_name}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {format(new Date(scout.created_date), "MMM d")}
                </p>
              </div>
            </div>
          ))}
          
          {badges.length === 0 && scouts.length === 0 && (
            <p className="text-center text-slate-500 py-8 text-sm">No recent activity</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}