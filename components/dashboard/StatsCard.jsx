import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsCard({ title, value, icon: Icon, gradient, linkTo, isLoading }) {
  if (isLoading) {
    return (
      <Card className="relative overflow-hidden border-0 shadow-lg bg-white">
        <CardContent className="p-6">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Link to={linkTo}>
      <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
        
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg transform group-hover:scale-110 transition-transform duration-500`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
          </div>
          
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}