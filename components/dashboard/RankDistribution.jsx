import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const rankOrder = ["Scout", "Tenderfoot", "Second Class", "First Class", "Star", "Life", "Eagle"];
const rankColors = {
  "Scout": "bg-slate-400",
  "Tenderfoot": "bg-green-500",
  "Second Class": "bg-blue-500",
  "First Class": "bg-indigo-500",
  "Star": "bg-purple-500",
  "Life": "bg-red-500",
  "Eagle": "bg-amber-500"
};

export default function RankDistribution({ scouts, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Rank Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const rankCounts = rankOrder.reduce((acc, rank) => {
    acc[rank] = scouts.filter(s => s.rank === rank && s.active).length;
    return acc;
  }, {});

  const maxCount = Math.max(...Object.values(rankCounts), 1);

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-slate-900">Rank Distribution</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {rankOrder.map((rank) => {
            const count = rankCounts[rank];
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            return (
              <div key={rank} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">{rank}</span>
                  <span className="text-sm font-bold text-slate-900">{count}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${rankColors[rank]} rounded-full transition-all duration-1000 ease-out shadow-sm`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}