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

export default function AnnouncementDialog({ open, onClose, onSave, announcement, isLoading }) {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    priority: "Normal",
    target_audience: "All",
    patrol_filter: "",
    expires_date: "",
  });

  useEffect(() => {
    if (announcement) {
      setFormData(announcement);
    } else {
      setFormData({
        title: "",
        message: "",
        priority: "Normal",
        target_audience: "All",
        patrol_filter: "",
        expires_date: "",
      });
    }
  }, [announcement, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {announcement ? "Edit Announcement" : "New Announcement"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Upcoming Campout Reminder"
                required
              />
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your announcement message..."
                rows={5}
                required
              />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-slate-900 border-b pb-2">Announcement Settings</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority *</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Important">Important</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="target_audience">Target Audience *</Label>
                <Select value={formData.target_audience} onValueChange={(value) => setFormData({ ...formData, target_audience: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Leaders Only">Leaders Only</SelectItem>
                    <SelectItem value="Specific Patrol">Specific Patrol</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.target_audience === "Specific Patrol" && (
              <div>
                <Label htmlFor="patrol_filter">Select Patrol</Label>
                <Select value={formData.patrol_filter} onValueChange={(value) => setFormData({ ...formData, patrol_filter: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a patrol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Eagles">Eagles</SelectItem>
                    <SelectItem value="Hawks">Hawks</SelectItem>
                    <SelectItem value="Wolves">Wolves</SelectItem>
                    <SelectItem value="Bears">Bears</SelectItem>
                    <SelectItem value="Panthers">Panthers</SelectItem>
                    <SelectItem value="Cobras">Cobras</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="expires_date">Expiration Date (Optional)</Label>
              <Input
                id="expires_date"
                type="date"
                value={formData.expires_date}
                onChange={(e) => setFormData({ ...formData, expires_date: e.target.value })}
              />
              <p className="text-xs text-slate-500 mt-1">
                When should this announcement stop displaying?
              </p>
            </div>
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
              {isLoading ? "Saving..." : "Save Announcement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}