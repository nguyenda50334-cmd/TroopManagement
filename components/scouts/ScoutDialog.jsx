import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTroop } from "../../context/TroopContext";

export default function ScoutDialog({ open, onClose, onSave, scout, isLoading }) {
  const { activeTroop } = useTroop();
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    patrol: "Unassigned",
    rank: "Scout",
    phone: "",
    email: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    join_date: "",
    position: "",
    active: true,
    medical_notes: "",
  });

  // Define patrols based on troop
  const getPatrolsForTroop = () => {
    if (activeTroop === "7514") {
      return ["Unassigned", "Leadership", "Hummingbirds", "Swans", "Flamingos"];
    } else {
      return ["Unassigned", "Leadership", "Eagles", "Buffalos", "Alligators"];
    }
  };

  const patrols = getPatrolsForTroop();

  useEffect(() => {
    if (scout) {
      setFormData(scout);
    } else {
      setFormData({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        patrol: "Unassigned",
        rank: "Unranked",
        phone: "",
        email: "",
        parent_name: "",
        parent_phone: "",
        parent_email: "",
        join_date: "",
        position: "",
        active: true,
        medical_notes: "",
      });
    }
  }, [scout, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {scout ? "Edit Scout" : "Add New Scout"}
          </DialogTitle>
          <p className="text-sm text-slate-500">Troop {activeTroop}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-slate-900 border-b pb-2">Personal Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="join_date">Join Date</Label>
                <Input
                  id="join_date"
                  type="date"
                  value={formData.join_date}
                  onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Scouting Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-slate-900 border-b pb-2">Scouting Information</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="patrol">Patrol *</Label>
                <Select value={formData.patrol} onValueChange={(value) => setFormData({ ...formData, patrol: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {patrols.map((patrol) => (
                      <SelectItem key={patrol} value={patrol}>
                        {patrol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="rank">Rank *</Label>
                <Select value={formData.rank} onValueChange={(value) => setFormData({ ...formData, rank: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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

              <div>
                <Label htmlFor="position">Leadership Position</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="e.g., SPL, Patrol Leader"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label htmlFor="active">Active Scout</Label>
            </div>
          </div>

          {/* Parent/Guardian Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-slate-900 border-b pb-2">Parent/Guardian Information</h3>
            
            <div>
              <Label htmlFor="parent_name">Parent/Guardian Name</Label>
              <Input
                id="parent_name"
                value={formData.parent_name}
                onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parent_email">Parent Email</Label>
                <Input
                  id="parent_email"
                  type="email"
                  value={formData.parent_email}
                  onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="parent_phone">Parent Phone</Label>
                <Input
                  id="parent_phone"
                  value={formData.parent_phone}
                  onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Medical Notes */}
          <div>
            <Label htmlFor="medical_notes">Medical Notes</Label>
            <Textarea
              id="medical_notes"
              value={formData.medical_notes}
              onChange={(e) => setFormData({ ...formData, medical_notes: e.target.value })}
              placeholder="Allergies, medications, or special medical needs..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {isLoading ? "Saving..." : "Save Scout"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}