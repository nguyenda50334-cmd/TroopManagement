import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Award, Star, Search, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTroop } from "/context/TroopContext";

import BadgeCard from "/components/badges/BadgeCard";
import BadgeDialog from "/components/badges/BadgeDialog";

// Generic fetch function for local JSON-server
const fetchJSON = async (endpoint) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}`);
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

export default function MeritBadges() {
  const { activeTroop } = useTroop();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedScoutId, setSelectedScoutId] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);

  const queryClient = useQueryClient();

  // Reset selected scout when troop changes
  useEffect(() => {
    setSelectedScoutId("all");
    setSearchTerm("");
    setStatusFilter("all");
  }, [activeTroop]);

  // Fetch badges and scouts from JSON-server
  const { data: badges = [], isLoading: badgesLoading } = useQuery({
    queryKey: ["meritBadges", activeTroop],
    queryFn: () => fetchJSON("meritBadges"),
  });

  const { data: scouts = [], isLoading: scoutsLoading } = useQuery({
    queryKey: ["scouts", activeTroop],
    queryFn: () => fetchJSON("scouts"),
  });

  // Filter scouts by active troop
  const troopScouts = scouts.filter(s => s.troop === activeTroop);
  const activeTroopScouts = troopScouts.filter(s => s.active);
  
  console.log('MeritBadges - activeTroop:', activeTroop);
  console.log('MeritBadges - all scouts:', scouts);
  console.log('MeritBadges - troopScouts:', troopScouts);
  console.log('MeritBadges - activeTroopScouts:', activeTroopScouts);

  // Filter badges by active troop
  const troopBadges = badges.filter(b => b.troop === activeTroop);

  // Local mutations using JSON-server
  const createBadgeMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/meritBadges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, troop: activeTroop }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meritBadges"] });
      setShowDialog(false);
      setEditingBadge(null);
    },
  });

  const updateBadgeMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/meritBadges/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meritBadges"] });
      setShowDialog(false);
      setEditingBadge(null);
    },
  });

  const handleMarkComplete = (badgeId) => {
    const badge = troopBadges.find(b => b.id === badgeId);
    if (!badge) {
      console.error('Badge not found:', badgeId);
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const updatedData = {
      ...badge,
      status: 'Completed',
      date_completed: today
    };
    
    updateBadgeMutation.mutate({ id: badgeId, data: updatedData });
  };

  // Delete merit badge
  const deleteBadgeMutation = useMutation({
    mutationFn: (id) =>
      fetch(`${import.meta.env.VITE_API_URL}/meritBadges/${id}`, {
        method: 'DELETE',
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meritBadges'] });
    },
  });

  const handleDelete = (badgeId) => {
    deleteBadgeMutation.mutate(badgeId);
  };

  const handleSave = (data) => {
    if (editingBadge) {
      updateBadgeMutation.mutate({ id: editingBadge.id, data });
    } else {
      createBadgeMutation.mutate(data);
    }
  };

  // Filters - only filter within troop badges
  const filteredBadges = troopBadges.filter(badge => {
    const matchesSearch = badge.badge_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || badge.status === statusFilter;
    const matchesScout = selectedScoutId === "all" || badge.scout_id === selectedScoutId;
    return matchesSearch && matchesStatus && matchesScout;
  });

  // Get selected scout (from troop scouts)
  const selectedScout = selectedScoutId !== "all" ? troopScouts.find(s => s.id === selectedScoutId) : null;

  // Group badges by type if a scout is selected
  const eagleRequired = selectedScout ? filteredBadges.filter(b => b.is_eagle_required) : [];
  const elective = selectedScout ? filteredBadges.filter(b => !b.is_eagle_required) : [];

  const eagleCompletedCount = eagleRequired.filter(b => b.status === "Completed").length;
  const electiveCompletedCount = elective.filter(b => b.status === "Completed").length;

  const eagleProgress = Math.round((eagleCompletedCount / 14) * 100);
  const electiveProgress = Math.round((electiveCompletedCount / 7) * 100);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Merit Badges</h1>
            <p className="text-slate-600">Track progress toward advancement - Troop {activeTroop}</p>
          </div>
          <Button
            onClick={() => {
              setEditingBadge(null);
              setShowDialog(true);
            }}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
            disabled={activeTroopScouts.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Merit Badge
          </Button>
        </div>

        {/* No scouts message */}
        {activeTroopScouts.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-amber-800 text-sm">
              No active scouts found for Troop {activeTroop}. Please add scouts first.
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Select Scout</label>
              <Select value={selectedScoutId} onValueChange={setSelectedScoutId}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Choose a scout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      All Scouts (Troop {activeTroop})
                    </div>
                  </SelectItem>
                  {activeTroopScouts.map((scout) => (
                    <SelectItem key={scout.id} value={scout.id}>
                      {scout.first_name} {scout.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Search Badges</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search badges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Filter by Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content */}
        {selectedScoutId === "all" ? (
          /* Show prompt to select a scout */
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Select a Scout</h2>
              <p className="text-slate-600 mb-6">
                Choose a scout from the dropdown above to view and manage their merit badge progress.
              </p>
              {activeTroopScouts.length > 0 && (
                <Button
                  onClick={() => setShowDialog(true)}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Merit Badge
                </Button>
              )}
            </div>
          </div>
        ) : selectedScout ? (
          /* Show selected scout's badges */
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {selectedScout.first_name} {selectedScout.last_name}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {filteredBadges.filter(b => b.status === "Completed").length} total badges completed
                  </p>
                </div>
              </div>

              {/* Progress Trackers */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <Card className="border-amber-200 bg-amber-50/50">
                  <CardContent className="pt-4">
                    <div className="text-sm font-medium flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-amber-600" />
                      Eagle Required Progress
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Completed</span>
                        <span className="font-bold text-slate-900">{eagleCompletedCount} / 14</span>
                      </div>
                      <Progress value={eagleProgress} className="h-2" />
                      <p className="text-xs text-slate-500">{eagleProgress}% Complete</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="pt-4">
                    <div className="text-sm font-medium flex items-center gap-2 mb-3">
                      <Award className="w-4 h-4 text-blue-600" />
                      Elective Progress
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Completed</span>
                        <span className="font-bold text-slate-900">{electiveCompletedCount} / 7</span>
                      </div>
                      <Progress value={electiveProgress} className="h-2" />
                      <p className="text-xs text-slate-500">{electiveProgress}% Complete</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Eagle Required Badges */}
              {eagleRequired.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-600" />
                    Eagle Required ({eagleRequired.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {eagleRequired.map((badge) => (
                      <BadgeCard
                        key={badge.id}
                        badge={badge}
                        scout={selectedScout}
                        onEdit={(badge) => {
                          setEditingBadge(badge);
                          setShowDialog(true);
                        }}
                        onMarkComplete={handleMarkComplete}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Elective Badges */}
              {elective.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    Elective ({elective.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {elective.map((badge) => (
                      <BadgeCard
                        key={badge.id}
                        badge={badge}
                        scout={selectedScout}
                        onEdit={(badge) => {
                          setEditingBadge(badge);
                          setShowDialog(true);
                        }}
                        onMarkComplete={handleMarkComplete}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {filteredBadges.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500 mb-4">No merit badges found</p>
                  <Button
                    onClick={() => setShowDialog(true)}
                    variant="outline"
                    className="border-green-500 text-green-700 hover:bg-green-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Badge
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : null}

        <BadgeDialog
          open={showDialog}
          onClose={() => {
            setShowDialog(false);
            setEditingBadge(null);
          }}
          onSave={handleSave}
          badge={editingBadge}
          scouts={scouts}
          isLoading={createBadgeMutation.isPending || updateBadgeMutation.isPending}
        />
      </div>
    </div>
  );
}