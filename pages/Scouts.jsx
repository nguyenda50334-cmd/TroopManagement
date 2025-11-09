import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTroop } from "../context/TroopContext";

import ScoutCard from "../components/scouts/ScoutCard";
import ScoutDialog from "../components/scouts/ScoutDialog";
import ScoutDetailDialog from "../components/scouts/ScoutDetailDialog";

export default function Scouts() {
  const { activeTroop } = useTroop();
  const [searchTerm, setSearchTerm] = useState("");
  const [patrolFilter, setPatrolFilter] = useState("all");
  const [rankFilter, setRankFilter] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editingScout, setEditingScout] = useState(null);
  const [selectedScout, setSelectedScout] = useState(null);

  const queryClient = useQueryClient();

  // Fetch scouts from local JSON Server - filtered by troop
  const { data: allScouts = [], isLoading } = useQuery({
    queryKey: ['scouts', activeTroop],
    queryFn: () =>
      fetch(`http://localhost:5000/scouts?troop=${activeTroop}`)
        .then(res => res.json()),
  });

  // Create scout
  const createScoutMutation = useMutation({
    mutationFn: (data) =>
      fetch('http://localhost:5000/scouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, troop: activeTroop }),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scouts', activeTroop] });
      setShowDialog(false);
      setEditingScout(null);
    },
  });

  // Update scout
  const updateScoutMutation = useMutation({
    mutationFn: ({ id, data }) =>
      fetch(`http://localhost:5000/scouts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scouts', activeTroop] });
      setShowDialog(false);
      setEditingScout(null);
    },
  });

  // Delete scout
  const deleteScoutMutation = useMutation({
    mutationFn: (id) =>
      fetch(`http://localhost:5000/scouts/${id}`, {
        method: 'DELETE',
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scouts', activeTroop] });
      // Play success sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 350;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.25);
    },
  });

  const handleDelete = (id) => {
    deleteScoutMutation.mutate(id);
  };

  const handleSave = (data) => {
    if (editingScout) {
      updateScoutMutation.mutate({ id: editingScout.id, data });
    } else {
      createScoutMutation.mutate(data);
    }
  };

  const handleEdit = (scout) => {
    setEditingScout(scout);
    setShowDialog(true);
  };

  const filteredScouts = allScouts.filter(scout => {
    const matchesSearch = 
      scout.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scout.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPatrol = patrolFilter === "all" || scout.patrol === patrolFilter;
    const matchesRank = rankFilter === "all" || scout.rank === rankFilter;
    return matchesSearch && matchesPatrol && matchesRank;
  });

  const activeScouts = filteredScouts.filter(s => s.active);
  const inactiveScouts = filteredScouts.filter(s => !s.active);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Scout Roster</h1>
            <p className="text-slate-600">Manage Troop {activeTroop} members</p>
          </div>
          <Button
            onClick={() => {
              setEditingScout(null);
              setShowDialog(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Scout
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search scouts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200 focus:border-blue-500"
              />
            </div>
            
            <Select value={patrolFilter} onValueChange={setPatrolFilter}>
              <SelectTrigger className="border-slate-200">
                <SelectValue placeholder="Filter by Patrol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patrols</SelectItem>
                <SelectItem value="Eagles">Eagles</SelectItem>
                <SelectItem value="Buffalos">Buffalos</SelectItem>
                <SelectItem value="Alligators">Alligators</SelectItem>
                <SelectItem value="Leadership">Leadership</SelectItem>
                <SelectItem value="Unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>

            <Select value={rankFilter} onValueChange={setRankFilter}>
              <SelectTrigger className="border-slate-200">
                <SelectValue placeholder="Filter by Rank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ranks</SelectItem>
                <SelectItem value="Unranked">Unranked</SelectItem>
                <SelectItem value="Scout">Scout</SelectItem>
                <SelectItem value="Tenderfoot">Tenderfoot</SelectItem>
                <SelectItem value="Second Class">Second Class</SelectItem>
                <SelectItem value="First Class">First Class</SelectItem>
                <SelectItem value="Star">Star</SelectItem>
                <SelectItem value="Life">Life</SelectItem>
                <SelectItem value="Eagle">Eagle</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Scouts */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Active Scouts ({activeScouts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeScouts.map((scout) => (
              <ScoutCard
                key={scout.id}
                scout={scout}
                onEdit={handleEdit}
                onView={setSelectedScout}
                onDelete={handleDelete}
              />
            ))}
          </div>
          {activeScouts.length === 0 && (
            <p className="text-center text-slate-500 py-12">No active scouts found</p>
          )}
        </div>

        {/* Inactive Scouts */}
        {inactiveScouts.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Inactive Scouts ({inactiveScouts.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactiveScouts.map((scout) => (
                <ScoutCard
                  key={scout.id}
                  scout={scout}
                  onEdit={handleEdit}
                  onView={setSelectedScout}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}

        {/* Dialogs */}
        <ScoutDialog
          open={showDialog}
          onClose={() => {
            setShowDialog(false);
            setEditingScout(null);
          }}
          onSave={handleSave}
          scout={editingScout}
          isLoading={createScoutMutation.isPending || updateScoutMutation.isPending}
        />

        <ScoutDetailDialog
          scout={selectedScout}
          onClose={() => setSelectedScout(null)}
        />
      </div>
    </div>
  );
}