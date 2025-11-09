import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import AnnouncementCard from "../components/communications/AnnouncementCard";
import AnnouncementDialog from "../components/communications/AnnouncementDialog";

// Generic fetch function for JSON-server
const fetchJSON = async (endpoint) => {
  const res = await fetch(`http://localhost:5000/${endpoint}`);
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

export default function Communications() {
  const [activeTab, setActiveTab] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const queryClient = useQueryClient();

  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => fetchJSON("announcements"),
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("http://localhost:5000/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setShowDialog(false);
      setEditingAnnouncement(null);
    },
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`http://localhost:5000/announcements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setShowDialog(false);
      setEditingAnnouncement(null);
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`http://localhost:5000/announcements/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  const handleSave = (data) => {
    if (editingAnnouncement) {
      updateAnnouncementMutation.mutate({ id: editingAnnouncement.id, data });
    } else {
      createAnnouncementMutation.mutate(data);
    }
  };

  const filteredAnnouncements = activeTab === "all"
    ? announcements
    : announcements.filter(a => a.priority === activeTab);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Communications</h1>
            <p className="text-slate-600">Share announcements with your troop</p>
          </div>
          <Button
            onClick={() => {
              setEditingAnnouncement(null);
              setShowDialog(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Announcement
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-4 bg-white shadow-md">
              <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                All
              </TabsTrigger>
              <TabsTrigger value="Urgent" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                Urgent
              </TabsTrigger>
              <TabsTrigger value="Important" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                Important
              </TabsTrigger>
              <TabsTrigger value="Normal" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Normal
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onEdit={(announcement) => {
                setEditingAnnouncement(announcement);
                setShowDialog(true);
              }}
              onDelete={(id) => deleteAnnouncementMutation.mutate(id)}
            />
          ))}

          {filteredAnnouncements.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">
                No {activeTab !== "all" ? activeTab.toLowerCase() : ""} announcements
              </p>
              {activeTab === "all" && (
                <Button
                  onClick={() => setShowDialog(true)}
                  variant="outline"
                  className="border-blue-500 text-blue-700 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Announcement
                </Button>
              )}
            </div>
          )}
        </div>

        <AnnouncementDialog
          open={showDialog}
          onClose={() => {
            setShowDialog(false);
            setEditingAnnouncement(null);
          }}
          onSave={handleSave}
          announcement={editingAnnouncement}
          isLoading={createAnnouncementMutation.isPending || updateAnnouncementMutation.isPending}
        />
      </div>
    </div>
  );
}
