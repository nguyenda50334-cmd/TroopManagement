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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTroop } from "../../context/TroopContext";

export default function BadgeDialog({ open, onClose, onSave, badge, scouts, isLoading }) {
  const { activeTroop } = useTroop();
  
  console.log('BadgeDialog - activeTroop:', activeTroop);
  console.log('BadgeDialog - all scouts:', scouts);
  console.log('BadgeDialog - filtered scouts:', scouts.filter(s => s.active && s.troop === activeTroop));
  
  const [formData, setFormData] = useState({
    scout_id: "",
    badge_name: "",
    counselor_name: "",
    status: "Not Started",
    date_started: "",
    date_completed: "",
    notes: "",
    is_eagle_required: false,
  });

  useEffect(() => {
    if (badge) {
      setFormData(badge);
    } else {
      setFormData({
        scout_id: "",
        badge_name: "",
        counselor_name: "",
        status: "Not Started",
        date_started: "",
        date_completed: "",
        notes: "",
        is_eagle_required: false,
      });
    }
  }, [badge, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add troop to the badge data
    onSave({
      ...formData,
      troop: activeTroop
    });
  };

  // Filter scouts by active troop and active status
  const filteredScouts = scouts.filter(s => s.active && s.troop === activeTroop);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {badge ? "Edit Merit Badge" : "Add Merit Badge"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {/* Scout Selection */}
              <div>
                <Label htmlFor="scout_id">Scout *</Label>
                <Select 
                  value={formData.scout_id} 
                  onValueChange={(value) => setFormData({ ...formData, scout_id: value })}
                  disabled={!!badge}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a scout" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredScouts.length === 0 ? (
                      <div className="p-2 text-sm text-slate-500 text-center">
                        No scouts available for Troop {activeTroop}
                      </div>
                    ) : (
                      filteredScouts.map((scout) => (
                        <SelectItem key={scout.id} value={scout.id}>
                          {scout.first_name} {scout.last_name} - {scout.rank}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1">
                  Showing scouts from Troop {activeTroop}
                </p>
              </div>

              {/* Badge Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-slate-900 border-b pb-2">Badge Information</h3>
                
                <div>
                  <Label htmlFor="badge_name">Merit Badge Name *</Label>
                  <Input
                    id="badge_name"
                    value={formData.badge_name}
                    onChange={(e) => setFormData({ ...formData, badge_name: e.target.value })}
                    placeholder="e.g., First Aid, Camping, Citizenship in the World"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="counselor_name">Counselor Name</Label>
                  <Input
                    id="counselor_name"
                    value={formData.counselor_name}
                    onChange={(e) => setFormData({ ...formData, counselor_name: e.target.value })}
                    placeholder="Merit badge counselor"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_eagle_required"
                    checked={formData.is_eagle_required}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_eagle_required: checked })}
                  />
                  <Label htmlFor="is_eagle_required">Eagle Required Merit Badge</Label>
                </div>
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_started">Date Started</Label>
                  <Input
                    id="date_started"
                    type="date"
                    value={formData.date_started}
                    onChange={(e) => setFormData({ ...formData, date_started: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="date_completed">Date Completed</Label>
                  <Input
                    id="date_completed"
                    type="date"
                    value={formData.date_completed}
                    onChange={(e) => setFormData({ ...formData, date_completed: e.target.value })}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Progress notes, requirements completed, next steps..."
                  rows={3}
                />
              </div>
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || filteredScouts.length === 0}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              {isLoading ? "Saving..." : "Save Badge"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}