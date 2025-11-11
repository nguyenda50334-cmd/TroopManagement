import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import AdvancementCard from "../components/advancements/AdvancementCard";
import AdvancementDialog from "../components/advancements/AdvancementDialog";

const rankOrder = ["Scout", "Tenderfoot", "Second Class", "First Class", "Star", "Life", "Eagle"];

// Fetch full bin from Jsonbin.io
const fetchJSONBin = async () => {
  const res = await fetch(`https://api.jsonbin.io/v3/b/${import.meta.env.VITE_JSONBIN_ID}`, {
    headers: {
      "X-Master-Key": import.meta.env.VITE_JSONBIN_KEY,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch from Jsonbin.io");
  const data = await res.json();
  return data.record; // Jsonbin stores your data inside "record"
};

// PUT full bin back to Jsonbin.io
const updateJSONBin = async (updatedBin) => {
  const res = await fetch(`https://api.jsonbin.io/v3/b/${import.meta.env.VITE_JSONBIN_ID}`, {
    method: "PUT",
    headers: {
      "X-Master-Key": import.meta.env.VITE_JSONBIN_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedBin),
  });
  if (!res.ok) throw new Error("Failed to update Jsonbin.io");
  return res.json();
};

export default function Advancements() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingAdvancement, setEditingAdvancement] = useState(null);
  const [rankFilter, setRankFilter] = useState("all");
  const queryClient = useQueryClient();

  // Fetch bin data
  const { data: binData = {} } = useQuery({
    queryKey: ["binData"],
    queryFn: fetchJSONBin,
  });

  const advancements = binData.advancements || [];
  const scouts = binData.scouts || [];

  // CREATE or UPDATE advancement
  const saveAdvancementMutation = useMutation({
    mutationFn: async (newOrUpdatedAdv) => {
      const updatedAdvancements = editingAdvancement
        ? advancements.map(a => (a.id === editingAdvancement.id ? { ...a, ...newOrUpdatedAdv } : a))
        : [...advancements, newOrUpdatedAdv];

      const updatedBin = { ...binData, advancements: updatedAdvancements };
      return updateJSONBin(updatedBin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["binData"] });
      setShowDialog(false);
      setEditingAdvancement(null);
    },
  });

  // UPDATE advancement status (and scout rank if needed)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ advancement, newStatus }) => {
      const today = new Date().toISOString().split('T')[0];
      let updatedAdv = { ...advancement, status: newStatus };

      // Update dates based on status
      if (newStatus === "SM Conference Complete") {
        updatedAdv.scoutmaster_conference_date = today;
      } else if (newStatus === "Board of Review Complete") {
        updatedAdv.board_of_review_date = today;
        updatedAdv.date_completed = today;

        // Update scout rank
        const scout = scouts.find(s => s.id === advancement.scout_id);
        if (scout) {
          const currentRankIndex = rankOrder.indexOf(advancement.rank);
          const nextRank = rankOrder[currentRankIndex + 1];
          if (nextRank) {
            scout.rank = nextRank;
            updatedAdv.status = "Awarded";
          } else {
            updatedAdv.status = "Awarded";
          }
        }
      }

      // Update advancements and scouts arrays in bin
      const updatedAdvancements = advancements.map(a => (a.id === advancement.id ? updatedAdv : a));
      const updatedBin = { ...binData, advancements: updatedAdvancements, scouts };
      return updateJSONBin(updatedBin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["binData"] });
    },
  });

  const handleSave = (data) => {
    saveAdvancementMutation.mutate(data);
  };

  const handleUpdateStatus = (advancement, newStatus) => {
    updateStatusMutation.mutate({ advancement, newStatus });
  };

  const filteredAdvancements = rankFilter === "all"
    ? advancements
    : advancements.filter(a => a.rank === rankFilter);

  const groupedByScout = filteredAdvancements.reduce((acc, advancement) => {
    if (!acc[advancement.scout_id]) acc[advancement.scout_id] = [];
    acc[advancement.scout_id].push(advancement);
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Rank Advancement</h1>
            <p className="text-slate-600">Track scouts' progress toward each rank</p>
          </div>
          <Button
            onClick={() => {
              setEditingAdvancement(null);
              setShowDialog(true);
            }}
            className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Advancement
          </Button>
        </div>

        {/* Rank Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <Select value={rankFilter} onValueChange={setRankFilter}>
            <SelectTrigger className="w-full md:w-64 border-slate-200">
              <SelectValue placeholder="Filter by Rank" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ranks</SelectItem>
              {rankOrder.map(rank => (
                <SelectItem key={rank} value={rank}>{rank}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Advancements by Scout */}
        <div className="space-y-6">
          {Object.entries(groupedByScout).map(([scoutId, scoutAdvancements]) => {
            const scout = scouts.find(s => s.id === scoutId);
            if (!scout) return null;

            return (
              <div key={scoutId} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {scout.first_name} {scout.last_name}
                    </h2>
                    <p className="text-sm text-slate-600">
                      Current Rank: <span className="font-medium text-slate-900">{scout.rank}</span>
                    </p>
                  </div>
                  <div className="text-sm text-slate-500">
                    {scoutAdvancements.filter(a => a.status === 'Awarded').length} / {scoutAdvancements.length} awarded
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scoutAdvancements
                    .sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank))
                    .map((advancement) => (
                      <AdvancementCard
                        key={advancement.id}
                        advancement={advancement}
                        scout={scout}
                        onEdit={(advancement) => {
                          setEditingAdvancement(advancement);
                          setShowDialog(true);
                        }}
                        onUpdateStatus={handleUpdateStatus}
                      />
                    ))}
                </div>
              </div>
            );
          })}

          {Object.keys(groupedByScout).length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 mb-4">No advancements tracked yet</p>
              <Button
                onClick={() => setShowDialog(true)}
                variant="outline"
                className="border-amber-500 text-amber-700 hover:bg-amber-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start Tracking Progress
              </Button>
            </div>
          )}
        </div>

        <AdvancementDialog
          open={showDialog}
          onClose={() => {
            setShowDialog(false);
            setEditingAdvancement(null);
          }}
          onSave={handleSave}
          advancement={editingAdvancement}
          scouts={scouts}
          isLoading={saveAdvancementMutation.isPending || updateStatusMutation.isPending}
        />
      </div>
    </div>
  );
}
