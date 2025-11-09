import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, CheckCircle, Edit, Award, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  "In Progress": "bg-blue-100 text-blue-700 border-blue-300",
  "Ready for SM Conference": "bg-purple-100 text-purple-700 border-purple-300",
  "SM Conference Complete": "bg-indigo-100 text-indigo-700 border-indigo-300",
  "Ready for Board of Review": "bg-amber-100 text-amber-700 border-amber-300",
  "Board of Review Complete": "bg-green-100 text-green-700 border-green-300",
  "Awarded": "bg-emerald-100 text-emerald-700 border-emerald-300"
};

const rankColors = {
  "Scout": "from-slate-400 to-slate-600",
  "Tenderfoot": "from-green-400 to-green-600",
  "Second Class": "from-blue-400 to-blue-600",
  "First Class": "from-indigo-400 to-indigo-600",
  "Star": "from-purple-400 to-purple-600",
  "Life": "from-red-400 to-red-600",
  "Eagle": "from-amber-400 to-amber-600"
};

export default function AdvancementCard({ advancement, scout, onEdit, onUpdateStatus }) {
  const requirements = advancement.requirements || {};
  const completedCount = Object.values(requirements).filter(v => v === true).length;
  const totalCount = Object.keys(requirements).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const allRequirementsComplete = totalCount > 0 && completedCount === totalCount;

  return (
    <Card className="group border-0 shadow-md hover:shadow-xl transition-all duration-500 bg-white overflow-hidden">
      <div className={`h-2 bg-gradient-to-r ${rankColors[advancement.rank]}`} />
      
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${rankColors[advancement.rank]} flex items-center justify-center shadow-md`}>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">
                {advancement.rank}
              </h3>
              <p className="text-xs text-slate-600">Rank Advancement</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Progress</span>
              <span className="font-medium">{completedCount}/{totalCount} ({progressPercent}%)</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${rankColors[advancement.rank]} transition-all duration-500`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-2 mb-4">
          <Badge className={`${statusColors[advancement.status]} border text-xs w-full justify-center`}>
            {advancement.status}
          </Badge>

          {/* Alert for next action */}
          {allRequirementsComplete && advancement.status === "In Progress" && (
            <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 p-2 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Ready for SM Conference</span>
            </div>
          )}

          {advancement.status === "SM Conference Complete" && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Ready for Board of Review</span>
            </div>
          )}

          {advancement.date_started && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Calendar className="w-3 h-3" />
              <span>Started {format(new Date(advancement.date_started), "MMM d, yyyy")}</span>
            </div>
          )}

          {advancement.scoutmaster_conference_date && (
            <div className="flex items-center gap-2 text-xs text-indigo-600">
              <CheckCircle className="w-3 h-3" />
              <span>SM Conf: {format(new Date(advancement.scoutmaster_conference_date), "MMM d, yyyy")}</span>
            </div>
          )}

          {advancement.board_of_review_date && (
            <div className="flex items-center gap-2 text-xs text-green-600">
              <Award className="w-3 h-3" />
              <span>BOR: {format(new Date(advancement.board_of_review_date), "MMM d, yyyy")}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(advancement)}
            className="w-full border-slate-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300"
          >
            <Edit className="w-3 h-3 mr-2" />
            Update Progress
          </Button>

          {/* Action buttons based on status */}
          {allRequirementsComplete && advancement.status === "In Progress" && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus(advancement, "Ready for SM Conference")}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <CheckCircle className="w-3 h-3 mr-2" />
              Mark Ready for SM Conf
            </Button>
          )}

          {advancement.status === "Ready for SM Conference" && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus(advancement, "SM Conference Complete")}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <CheckCircle className="w-3 h-3 mr-2" />
              Complete SM Conference
            </Button>
          )}

          {advancement.status === "SM Conference Complete" && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus(advancement, "Ready for Board of Review")}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              <CheckCircle className="w-3 h-3 mr-2" />
              Mark Ready for BOR
            </Button>
          )}

          {advancement.status === "Ready for Board of Review" && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus(advancement, "Board of Review Complete")}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Award className="w-3 h-3 mr-2" />
              Complete Board of Review
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}