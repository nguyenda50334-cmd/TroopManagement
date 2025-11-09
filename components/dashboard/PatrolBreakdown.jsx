import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield } from "lucide-react";

const patrolColors = {
  "Eagles": "from-amber-400 to-amber-600",
  "Buffalos": "from-red-400 to-red-600",
  "Alligators": "from-green-400 to-green-600",
  "Leadership": "from-yellow-600 to-yellow-800",
  "Unassigned": "from-gray-300 to-gray-500"
};

export default function PatrolBreakdown({ scouts, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Patrol Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  const patrolCounts = scouts.reduce((acc, scout) => {
    if (scout.active) {
      acc[scout.patrol] = (acc[scout.patrol] || 0) + 1;
    }
    return acc;
  }, {});

  const sortedPatrols = Object.entries(patrolCounts)
    .sort(([, a], [, b]) => b - a);

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-slate-900">Patrol Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {sortedPatrols.map(([patrol, count]) => (
            <div key={patrol} className="group">
              <div className={`flex items-center justify-between p-4 rounded-xl bg-gradient-to-r ${patrolColors[patrol]} shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-white" />
                  <span className="font-semibold text-white">{patrol}</span>
                </div>
                <span className="text-2xl font-bold text-white">{count}</span>
              </div>
            </div>
          ))}
          {sortedPatrols.length === 0 && (
            <p className="text-center text-slate-500 py-8">No patrol assignments yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}