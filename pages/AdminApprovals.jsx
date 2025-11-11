import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Shield, Users as UsersIcon } from "lucide-react";
import { format } from "date-fns";

// Helper function to interact with Jsonbin.io
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
  return json.record; // Jsonbin wraps data in "record"
};

export default function AdminApprovals() {
  const [filter, setFilter] = useState("all"); // all, scouts, leaders
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const binData = await fetchJSONBin();
      return binData.users || [];
    },
  });

  // Fetch entire bin for mutations
  const fetchBinData = async () => {
    const binData = await fetchJSONBin();
    return binData;
  };

  // Approve user mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, userData }) => {
      const binData = await fetchBinData();

      // Update the specific user
      const updatedUsers = binData.users.map(u =>
        u.id === id ? { ...u, approved: true, pendingApproval: false } : u
      );

      // Add scout if needed
      const updatedScouts = [...(binData.scouts || [])];
      if (userData.userType === "scout") {
        updatedScouts.push({
          id: `scout-${Date.now()}`,
          first_name: userData.firstName,
          last_name: userData.lastName,
          date_of_birth: "",
          patrol: "Unassigned",
          rank: "Unranked",
          phone: "",
          email: userData.email,
          parent_name: "",
          parent_phone: "",
          parent_email: "",
          join_date: new Date().toISOString().split("T")[0],
          position: "",
          active: true,
          medical_notes: ""
        });
      }

      // Save back to Jsonbin
      return fetchJSONBin("PUT", {
        ...binData,
        users: updatedUsers,
        scouts: updatedScouts
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["scouts"] });
    }
  });

  // Reject user mutation
  const rejectMutation = useMutation({
    mutationFn: async (id) => {
      const binData = await fetchBinData();
      const updatedUsers = binData.users.filter(u => u.id !== id);

      return fetchJSONBin("PUT", { ...binData, users: updatedUsers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  });

  const handleApprove = (user) => {
    if (confirm(`Approve ${user.firstName} ${user.lastName} as a ${user.userType}?`)) {
      approveMutation.mutate({ id: user.id, userData: user });
    }
  };

  const handleReject = (user) => {
    if (confirm(`Reject ${user.firstName} ${user.lastName}'s registration?`)) {
      rejectMutation.mutate(user.id);
    }
  };

  // Filter users
  const pendingUsers = users.filter(u => u.pendingApproval && !u.approved);
  const approvedUsers = users.filter(u => u.approved);

  let displayUsers = pendingUsers;
  if (filter === "scouts") displayUsers = pendingUsers.filter(u => u.userType === "scout");
  if (filter === "leaders") displayUsers = pendingUsers.filter(u => u.userType === "leader");

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">User Approvals</h1>
          <p className="text-slate-600">Review and approve pending registrations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{pendingUsers.length}</div>
                <div className="text-sm text-slate-600">Pending Approval</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{approvedUsers.length}</div>
                <div className="text-sm text-slate-600">Approved Users</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{users.length}</div>
                <div className="text-sm text-slate-600">Total Users</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="inline-flex bg-white rounded-lg shadow-md p-1">
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 ${
                filter === "all" ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              All ({pendingUsers.length})
            </button>
            <button
              onClick={() => setFilter("scouts")}
              className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 ${
                filter === "scouts" ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Scouts ({pendingUsers.filter(u => u.userType === "scout").length})
            </button>
            <button
              onClick={() => setFilter("leaders")}
              className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 ${
                filter === "leaders" ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Leaders ({pendingUsers.filter(u => u.userType === "leader").length})
            </button>
          </div>
        </div>

        {/* Pending Users List */}
        <div className="space-y-4">
          {displayUsers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">All Caught Up!</h3>
              <p className="text-slate-600">No pending approvals at this time.</p>
            </div>
          ) : (
            displayUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 text-lg">
                          {user.firstName} {user.lastName}
                        </h3>
                        {user.userType === "leader" && (
                          <Shield className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge className={`${
                          user.userType === "leader" 
                            ? "bg-amber-100 text-amber-800 border-amber-200" 
                            : "bg-blue-100 text-blue-800 border-blue-200"
                        } border`}>
                          {user.userType === "leader" ? "Leader" : "Scout"}
                        </Badge>
                        <Badge className="bg-slate-100 text-slate-800 border-slate-200 border">
                          Troop {user.troop}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-slate-600">{user.email}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Registered {format(new Date(user.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      onClick={() => handleApprove(user)}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md"
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(user)}
                      variant="outline"
                      className="border-2 border-red-500 text-red-600 hover:bg-red-50"
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
