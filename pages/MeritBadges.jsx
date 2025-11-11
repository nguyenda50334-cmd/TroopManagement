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

// JSONBin setup
const JSONBIN_BASE_URL = `https://api.jsonbin.io/v3/b/${import.meta.env.VITE_JSONBIN_ID}`;
const fetchJSONBin = async (method = "GET", data) => {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": import.meta.env.VITE_JSONBIN_KEY,
    },
  };
  if (data) options.body = JSON.stringify(data);

  const res = await fetch(JSONBIN_BASE_URL, options);
  if (!res.ok) throw new Error(`Jsonbin request failed: ${res.status}`);
  const json = await res.json();
  return json.record;
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

  // Fetch entire JSONBin data for badges and scouts
  const { data: binData = {}, isLoading } = useQuery({
    queryKey: ["jsonbin", activeTroop],
    queryFn: () => fetchJSONBin(),
  });

  const badges = binData.meritBadges || [];
  const scouts = binData.scouts || [];

  // Filter scouts by active troop
  const troopScouts = scouts.filter(s => s.troop === activeTroop);
  const activeTroopScouts = troopScouts.filter(s => s.active);

  // Filter badges by active troop
  const troopBadges = badges.filter(b => b.troop === activeTroop);

  // Create mutation
  const createBadgeMutation = useMutation({
    mutationFn: async (data) => {
      const bin = await fetchJSONBin();
      const updatedBadges = [...(bin.meritBadges || []), { ...data, troop: activeTroop, id: `badge-${Date.now()}` }];
      return fetchJSONBin("PUT", { ...bin, meritBadges: updatedBadges });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jsonbin"] });
      setShowDialog(false);
      setEditingBadge(null);
    },
  });

  // Update mutation
  const updateBadgeMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const bin = await fetchJSONBin();
      const updatedBadges = (bin.meritBadges || []).map(b => (b.id === id ? { ...b, ...data } : b));
      return fetchJSONBin("PUT", { ...bin, meritBadges: updatedBadges });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jsonbin"] });
      setShowDialog(false);
      setEditingBadge(null);
    },
  });

  // Delete mutation
  const deleteBadgeMutation = useMutation({
    mutationFn: async (id) => {
      const bin = await fetchJSONBin();
      const updatedBadges = (bin.meritBadges || []).filter(b => b.id !== id);
      return fetchJSONBin("PUT", { ...bin, meritBadges: updatedBadges });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jsonbin"] }),
  });

  const handleMarkComplete = (badgeId) => {
    const badge = troopBadges.find(b => b.id === badgeId);
    if (!badge) return;
    const today = new Date().toISOString().split("T")[0];
    updateBadgeMutation.mutate({ id: badgeId, data: { ...badge, status: "Completed", date_completed: today } });
  };

  const handleDelete = (id) => deleteBadgeMutation.mutate(id);
  const handleSave = (data) => {
    if (editingBadge) updateBadgeMutation.mutate({ id: editingBadge.id, data });
    else createBadgeMutation.mutate(data);
  };

  // Filters
  const filteredBadges = troopBadges.filter(b => {
    const matchesSearch = b.badge_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const matchesScout = selectedScoutId === "all" || b.scout_id === selectedScoutId;
    return matchesSearch && matchesStatus && matchesScout;
  });

  const selectedScout = selectedScoutId !== "all" ? troopScouts.find(s => s.id === selectedScoutId) : null;

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
            onClick={() => { setEditingBadge(null); setShowDialog(true); }}
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
            <p className="text-amber-800 text-sm">No active scouts found for Troop {activeTroop}. Please add scouts first.</p>
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
                  {activeTroopScouts.map((s) => <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name}</SelectItem>)}
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

        {/* Badge Content */}
        {selectedScoutId === "all" ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Select a Scout</h2>
              <p className="text-slate-600 mb-6">Choose a scout from the dropdown above to view and manage their merit badge progress.</p>
              {activeTroopScouts.length > 0 && (
                <Button onClick={() => setShowDialog(true)} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                  <Plus className="w-4 h-4 mr-2" /> Add Merit Badge
                </Button>
              )}
            </div>
          </div>
        ) : selectedScout ? (
          <div className="space-y-6">
            {/* Progress Cards */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedScout.first_name} {selectedScout.last_name}</h2>
                  <p className="text-sm text-slate-600">{filteredBadges.filter(b => b.status === "Completed").length} total badges completed</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <Card className="border-amber-200 bg-amber-50/50">
                  <CardContent className="pt-4">
                    <div className="text-sm font-medium flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-amber-600" /> Eagle Required Progress
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
                      <Award className="w-4 h-4 text-blue-600" /> Elective Progress
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
                    <Star className="w-5 h-5 text-amber-600" /> Eagle Required ({eagleRequired.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {eagleRequired.map(b => (
                      <BadgeCard key={b.id} badge={b} scout={selectedScout} onEdit={(badge) => { setEditingBadge(badge); setShowDialog(true); }} onMarkComplete={handleMarkComplete} onDelete={handleDelete} />
                    ))}
                  </div>
                </div>
              )}

              {/* Elective Badges */}
              {elective.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" /> Elective ({elective.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {elective.map(b => (
                      <BadgeCard key={b.id} badge={b} scout={selectedScout} onEdit={(badge) => { setEditingBadge(badge); setShowDialog(true); }} onMarkComplete={handleMarkComplete} onDelete={handleDelete} />
                    ))}
                  </div>
                </div>
              )}

              {filteredBadges.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500 mb-4">No merit badges found</p>
                  <Button onClick={() => setShowDialog(true)} variant="outline" className="border-green-500 text-green-700 hover:bg-green-50">
                    <Plus className="w-4 h-4 mr-2" /> Add First Badge
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : null}

        <BadgeDialog
          open={showDialog}
          onClose={() => { setShowDialog(false); setEditingBadge(null); }}
          onSave={handleSave}
          badge={editingBadge}
          scouts={scouts}
          isLoading={createBadgeMutation.isPending || updateBadgeMutation.isPending}
        />
      </div>
    </div>
  );
}
