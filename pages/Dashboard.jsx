import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Users, Award, Calendar, TrendingUp, Plus, ChevronRight, Shield, MapPin } from "lucide-react";
import { useTroop } from "../context/TroopContext";

const StatsCard = ({ title, value, icon: Icon, gradient, isLoading, linkTo }) => {
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 animate-pulse">
        <div className="h-20 sm:h-24 bg-slate-200 rounded"></div>
      </div>
    );
  }

  const handleClick = () => {
    if (linkTo) {
      navigate(linkTo);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      
      <div className="relative">
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <div className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${gradient} shadow-lg transform group-hover:scale-110 transition-transform duration-500`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
        </div>
        
        <div>
          <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

const PatrolBreakdown = ({ scouts, isLoading }) => {
  const patrolColors = {
    "Eagles": "from-amber-400 to-amber-600",
    "Buffalos": "from-red-400 to-red-600",
    "Alligators": "from-green-400 to-green-600",
    "Leadership": "from-blue-400 to-blue-600",
    "Unassigned": "from-gray-300 to-gray-500"
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-0 p-4 sm:p-6 animate-pulse">
        <div className="h-48 bg-slate-200 rounded"></div>
      </div>
    );
  }

  const patrolCounts = scouts.reduce((acc, scout) => {
    if (scout.active) {
      acc[scout.patrol] = (acc[scout.patrol] || 0) + 1;
    }
    return acc;
  }, {});

  const sortedPatrols = Object.entries(patrolCounts).sort(([, a], [, b]) => b - a);
  const maxCount = Math.max(...Object.values(patrolCounts), 1);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-0">
      <div className="p-4 sm:p-6 border-b border-slate-100">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-900" />
          Patrol Breakdown
        </h2>
      </div>
      <div className="p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          {sortedPatrols.map(([patrol, count]) => {
            const percentage = (count / maxCount) * 100;
            return (
              <div key={patrol}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">{patrol}</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">{count} scouts</span>
                </div>
                <div className="h-8 sm:h-10 bg-slate-100 rounded-lg sm:rounded-xl overflow-hidden relative">
                  <div
                    className={`h-full bg-gradient-to-r ${patrolColors[patrol] || patrolColors.Unassigned} transition-all duration-1000 ease-out flex items-center justify-end pr-2 sm:pr-3`}
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage > 20 && (
                      <span className="text-white font-bold text-xs sm:text-sm drop-shadow-lg">
                        {Math.round(percentage)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {sortedPatrols.length === 0 && (
            <p className="text-center text-slate-500 py-8 text-sm">No patrol assignments yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

const RankDistribution = ({ scouts, isLoading }) => {
  const rankOrder = ["Unranked", "Scout", "Tenderfoot", "Second Class", "First Class", "Star", "Life", "Eagle"];
  const rankColors = {
    "Unranked": "bg-slate-400",
    "Scout": "bg-slate-500",
    "Tenderfoot": "bg-green-500",
    "Second Class": "bg-blue-500",
    "First Class": "bg-indigo-500",
    "Star": "bg-purple-500",
    "Life": "bg-red-500",
    "Eagle": "bg-amber-500"
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-0 p-4 sm:p-6 animate-pulse">
        <div className="h-48 sm:h-64 bg-slate-200 rounded"></div>
      </div>
    );
  }

  const rankCounts = rankOrder.reduce((acc, rank) => {
    acc[rank] = scouts.filter(s => s.rank === rank && s.active).length;
    return acc;
  }, {});

  const maxCount = Math.max(...Object.values(rankCounts), 1);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-0">
      <div className="p-4 sm:p-6 border-b border-slate-100">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-blue-900" />
          Rank Distribution
        </h2>
      </div>
      <div className="p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          {rankOrder.map((rank) => {
            const count = rankCounts[rank];
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            return (
              <div key={rank} className="space-y-1.5 sm:space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-medium text-slate-700">{rank}</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">{count}</span>
                </div>
                <div className="h-2.5 sm:h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${rankColors[rank]} rounded-full transition-all duration-1000 ease-out shadow-sm`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const RecentActivity = ({ scouts, meritBadges, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-0 p-4 sm:p-6 animate-pulse">
        <div className="h-48 bg-slate-200 rounded"></div>
      </div>
    );
  }

  function formatTimeAgo(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }

  const recentBadges = meritBadges
    .filter(b => b.status === 'Completed' && b.date_completed)
    .sort((a, b) => new Date(b.date_completed) - new Date(a.date_completed))
    .slice(0, 3)
    .map(badge => {
      const scout = scouts.find(s => s.id === badge.scout_id);
      return {
        name: scout ? `${scout.first_name} ${scout.last_name}` : 'Unknown Scout',
        action: `Earned ${badge.badge_name} Badge`,
        time: formatTimeAgo(badge.date_completed),
        type: 'badge'
      };
    });

  const recentScouts = scouts
    .filter(s => s.join_date)
    .sort((a, b) => new Date(b.join_date) - new Date(a.join_date))
    .slice(0, 2)
    .map(scout => ({
      name: `${scout.first_name} ${scout.last_name}`,
      action: 'Joined the troop',
      time: formatTimeAgo(scout.join_date),
      type: 'new'
    }));

  const activities = [...recentBadges, ...recentScouts]
    .sort((a, b) => 0)
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-0">
      <div className="p-4 sm:p-6 border-b border-slate-100">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-900" />
          Recent Activity
        </h2>
      </div>
      <div className="p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs sm:text-sm">
                    {activity.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                    {activity.name}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    {activity.action}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-500 py-8 text-sm">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

const UpcomingEvents = ({ events, isLoading }) => {
  const navigate = useNavigate();
  
  const typeColors = {
    "Meeting": "bg-blue-100 text-blue-800",
    "Campout": "bg-green-100 text-green-800",
    "Service Project": "bg-purple-100 text-purple-800",
    "Court of Honor": "bg-amber-100 text-amber-800",
    "Fundraiser": "bg-pink-100 text-pink-800",
    "Training": "bg-indigo-100 text-indigo-800",
    "Other": "bg-slate-100 text-slate-800"
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-0 p-4 sm:p-6 animate-pulse">
        <div className="h-48 sm:h-64 bg-slate-200 rounded"></div>
      </div>
    );
  }

  const upcomingEvents = events
    .filter(e => {
      if (!e.start_date) return false;
      const [year, month, day] = e.start_date.split('-').map(Number);
      const eventDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    })
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .slice(0, 3);

  function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-0">
      <div className="p-4 sm:p-6 border-b border-slate-100">
        <div className="flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-900" />
            Upcoming Events
          </h2>
          <button 
            onClick={() => navigate('/app/events')}
            className="text-blue-900 hover:text-blue-700 font-semibold text-xs sm:text-sm flex items-center gap-1 transition-colors"
          >
            View All
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <div key={event.id} className="group p-3 sm:p-4 border border-slate-200 rounded-lg sm:rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-300 bg-slate-50 hover:bg-white cursor-pointer">
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                  <div className="flex-1 pr-2">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-900 transition-colors mb-1.5 sm:mb-2">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        {formatDate(event.start_date)}
                      </span>
                    </div>
                  </div>
                  <span className={`${typeColors[event.event_type] || typeColors.Other} text-[10px] sm:text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap`}>
                    {event.event_type}
                  </span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600 pt-2 sm:pt-3 border-t border-slate-100">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-slate-500 py-8 text-sm">No upcoming events scheduled</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { activeTroop } = useTroop();
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userFirstName = currentUser.firstName || 'Leader';
  
  const { data: allScouts = [], isLoading: scoutsLoading } = useQuery({
    queryKey: ['scouts', activeTroop],
    queryFn: () => fetch(`${import.meta.env.VITE_API_URL}/scouts`).then(res => res.json()),
  });

  const { data: allMeritBadges = [], isLoading: badgesLoading } = useQuery({
    queryKey: ['meritBadges', activeTroop],
    queryFn: () => fetch(`${import.meta.env.VITE_API_URL}/meritBadges`).then(res => res.json()),
  });

  const { data: allEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['events', activeTroop],
    queryFn: () => fetch(`${import.meta.env.VITE_API_URL}/events`).then(res => res.json()),
  });

  // Filter by troop
  const scouts = allScouts.filter(s => s.troop === activeTroop);
  const meritBadges = allMeritBadges.filter(b => b.troop === activeTroop);
  const events = allEvents.filter(e => e.troop === activeTroop);

  const isLoading = scoutsLoading || badgesLoading || eventsLoading;

  const activeScouts = scouts.filter(s => s.active).length;
  const completedBadges = meritBadges.filter(b => b.status === 'Completed').length;
  const upcomingEventsCount = events.filter(e => {
    if (!e.start_date) return false;
    const [year, month, day] = e.start_date.split('-').map(Number);
    const eventDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  }).length;

  return (
    <div className="p-3 sm:p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-1 sm:mb-2">
              Welcome Back, {userFirstName}
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Here's what's happening with Troop {activeTroop} today
            </p>
          </div>
          <button 
            onClick={() => navigate('/app/scouts')}
            className="bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg px-5 py-2.5 sm:px-6 sm:py-3 transition-all duration-200 hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add Scout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <StatsCard
            title="Total Scouts"
            value={activeScouts}
            icon={Users}
            gradient="from-blue-900 to-blue-700"
            linkTo="/app/scouts"
            isLoading={isLoading}
          />
          <StatsCard
            title="Merit Badges Earned"
            value={completedBadges}
            icon={Award}
            gradient="from-amber-500 to-amber-400"
            linkTo="/app/meritbadges"
            isLoading={isLoading}
          />
          <StatsCard
            title="Upcoming Events"
            value={upcomingEventsCount}
            icon={Calendar}
            gradient="from-emerald-600 to-emerald-500"
            linkTo="/app/events"
            isLoading={isLoading}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <UpcomingEvents events={events} isLoading={eventsLoading} />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <PatrolBreakdown scouts={scouts} isLoading={scoutsLoading} />
              <RankDistribution scouts={scouts} isLoading={scoutsLoading} />
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-4 sm:space-y-6">
            <RecentActivity 
              scouts={scouts} 
              meritBadges={meritBadges} 
              isLoading={isLoading} 
            />
            
            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg text-white">
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Quick Actions</h3>
              <div className="space-y-2 sm:space-y-3">
                <button 
                  onClick={() => navigate('/app/events')}
                  className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-left transition-all duration-200 flex items-center justify-between group"
                >
                  <span className="font-medium text-sm sm:text-base">Record Attendance</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => navigate('/app/meritbadges')}
                  className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-left transition-all duration-200 flex items-center justify-between group"
                >
                  <span className="font-medium text-sm sm:text-base">Award Badge</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => navigate('/app/events')}
                  className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-left transition-all duration-200 flex items-center justify-between group"
                >
                  <span className="font-medium text-sm sm:text-base">Schedule Event</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}