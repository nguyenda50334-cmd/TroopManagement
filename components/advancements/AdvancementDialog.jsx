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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

// Sample requirements for each rank (you can customize these)
const RANK_REQUIREMENTS = {
  "Scout": ["1a", "1b", "1c", "2", "3", "4", "5", "6", "7"],
  "Tenderfoot": ["1a", "1b", "1c", "1d", "2a", "2b", "2c", "2d", "2e", "2f", "3a", "3b", "3c", "3d", "4a", "4b"],
  "Second Class": ["1a", "1b", "1c", "2a", "2b", "2c", "2d", "2e", "2f", "2g", "3a", "3b", "3c", "3d", "4", "5a", "5b", "5c", "5d", "6a", "6b", "6c", "6d", "7a", "7b"],
  "First Class": ["1a", "1b", "2a", "2b", "2c", "2d", "2e", "2f", "3a", "3b", "3c", "3d", "4a", "4b", "5a", "5b", "5c", "6a", "6b", "6c", "6d", "7a", "7b", "7c", "7d", "8a", "8b", "8c", "8d", "8e"],
  "Star": ["1", "2", "3", "4", "5", "6"],
  "Life": ["1", "2", "3", "4", "5", "6", "7"],
  "Eagle": ["1", "2", "3", "4", "5", "6", "7", "8"]
};

export default function AdvancementDialog({ open, onClose, onSave, advancement, scouts, isLoading }) {
  const [formData, setFormData] = useState({
    scout_id: "",
    rank: "Scout",
    status: "In Progress",
    date_started: "",
    date_completed: "",
    scoutmaster_conference_date: "",
    board_of_review_date: "",
    requirements: {},
    notes: "",
  });

  useEffect(() => {
    if (advancement) {
      setFormData(advancement);
    } else {
      setFormData({
        scout_id: "",
        rank: "Scout",
        status: "In Progress",
        date_started: "",
        date_completed: "",
        scoutmaster_conference_date: "",
        board_of_review_date: "",
        requirements: {},
        notes: "",
      });
    }
  }, [advancement, open]);

  // Initialize requirements when rank changes
  useEffect(() => {
    if (!advancement && formData.rank) {
      const rankReqs = RANK_REQUIREMENTS[formData.rank] || [];
      const initialReqs = {};
      rankReqs.forEach(req => {
        initialReqs[req] = false;
      });
      setFormData(prev => ({ ...prev, requirements: initialReqs }));
    }
  }, [formData.rank, advancement]);

  const handleRequirementToggle = (reqId) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [reqId]: !prev.requirements[reqId]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const requirements = formData.requirements || {};
  const rankReqs = RANK_REQUIREMENTS[formData.rank] || [];
  const completedCount = Object.values(requirements).filter(v => v === true).length;
  const totalCount = rankReqs.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {advancement ? "Update Advancement" : "Add Advancement"}
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
                  disabled={!!advancement}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a scout" />
                  </SelectTrigger>
                  <SelectContent>
                    {scouts.filter(s => s.active).map((scout) => (
                      <SelectItem key={scout.id} value={scout.id}>
                        {scout.first_name} {scout.last_name} - Current: {scout.rank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rank */}
              <div>
                <Label htmlFor="rank">Rank *</Label>
                <Select 
                  value={formData.rank} 
                  onValueChange={(value) => setFormData({ ...formData, rank: value })}
                  disabled={!!advancement}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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

              {/* Requirements Checklist */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-semibold text-lg text-slate-900">Requirements</h3>
                  <span className="text-sm text-slate-600">
                    {completedCount}/{totalCount} ({progressPercent}%)
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-2 bg-slate-50 rounded-lg">
                  {rankReqs.map((req) => (
                    <div key={req} className="flex items-center space-x-2">
                      <Checkbox
                        id={`req-${req}`}
                        checked={requirements[req] || false}
                        onCheckedChange={() => handleRequirementToggle(req)}
                      />
                      <label
                        htmlFor={`req-${req}`}
                        className={`text-sm cursor-pointer ${
                          requirements[req] ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        Requirement {req}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-slate-900 border-b pb-2">Timeline</h3>
                
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
                    <Label htmlFor="scoutmaster_conference_date">SM Conference Date</Label>
                    <Input
                      id="scoutmaster_conference_date"
                      type="date"
                      value={formData.scoutmaster_conference_date}
                      onChange={(e) => setFormData({ ...formData, scoutmaster_conference_date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="board_of_review_date">Board of Review Date</Label>
                    <Input
                      id="board_of_review_date"
                      type="date"
                      value={formData.board_of_review_date}
                      onChange={(e) => setFormData({ ...formData, board_of_review_date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="date_completed">Date Awarded</Label>
                    <Input
                      id="date_completed"
                      type="date"
                      value={formData.date_completed}
                      onChange={(e) => setFormData({ ...formData, date_completed: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Progress Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Requirements completed, next steps, board of review notes..."
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
              disabled={isLoading}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
            >
              {isLoading ? "Saving..." : "Save Advancement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}