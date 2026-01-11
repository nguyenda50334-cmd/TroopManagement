import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, User, ShoppingCart } from "lucide-react";

export default function CreateExpenseDialog({ open, onClose, onSave, scouts, expense, isLoading }) {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [description, setDescription] = useState("");
  const [shoppingLists, setShoppingLists] = useState([]);
  const [showScoutSelector, setShowScoutSelector] = useState(false);

  useEffect(() => {
    if (expense) {
      setEventName(expense.eventName || "");
      setEventDate(expense.eventDate || "");
      setDescription(expense.description || "");
      setShoppingLists(expense.shoppingLists || []);
    } else {
      setEventName("");
      setEventDate("");
      setDescription("");
      setShoppingLists([]);
    }
  }, [expense, open]);

  const handleAddShoppingList = (scoutId) => {
    const newList = {
      id: `list-${Date.now()}`,
      scout_id: scoutId,
      items: [],
    };
    setShoppingLists([...shoppingLists, newList]);
    setShowScoutSelector(false);
  };

  const handleRemoveShoppingList = (listId) => {
    setShoppingLists(shoppingLists.filter((list) => list.id !== listId));
  };

  const handleAddItem = (listId) => {
    setShoppingLists(
      shoppingLists.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: [...(list.items || []), { name: "", quantity: "", cost: 0 }],
            }
          : list
      )
    );
  };

  const handleRemoveItem = (listId, itemIndex) => {
    setShoppingLists(
      shoppingLists.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.filter((_, idx) => idx !== itemIndex),
            }
          : list
      )
    );
  };

  const handleItemChange = (listId, itemIndex, field, value) => {
    setShoppingLists(
      shoppingLists.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.map((item, idx) =>
                idx === itemIndex
                  ? { ...item, [field]: field === "cost" ? parseFloat(value) || 0 : value }
                  : item
              ),
            }
          : list
      )
    );
  };

  const handleSubmit = () => {
    if (!eventName.trim()) {
      alert("Please enter an event name");
      return;
    }

    onSave({
      eventName: eventName.trim(),
      eventDate,
      description: description.trim(),
      shoppingLists,
    });
  };

  const totalCost = shoppingLists.reduce((sum, list) => {
    const listTotal = list.items?.reduce((itemSum, item) => itemSum + (item.cost || 0), 0) || 0;
    return sum + listTotal;
  }, 0);

  const availableScouts = scouts.filter(
    (scout) => !shoppingLists.some((list) => list.scout_id === scout.id)
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Expense Event" : "Create Expense Event"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="eventName">Event Name *</Label>
              <Input
                id="eventName"
                placeholder="e.g., Summer Camp, Weekly Meeting Supplies"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eventDate">Event Date</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Total Cost</Label>
                <div className="mt-1 bg-red-50 border-2 border-red-200 rounded-lg p-3">
                  <p className="text-2xl font-bold text-red-600">
                    ${totalCost.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Optional notes about this expense"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Shopping Lists */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <Label className="text-lg">Shopping Lists</Label>
              <Button
                size="sm"
                onClick={() => setShowScoutSelector(true)}
                className="bg-green-600 hover:bg-green-700"
                disabled={availableScouts.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Scout List
              </Button>
            </div>

            {/* Scout Selector */}
            {showScoutSelector && (
              <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <div className="flex justify-between items-center mb-3">
                  <p className="font-semibold text-slate-900">Select a Scout</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowScoutSelector(false)}
                    className="text-slate-600"
                  >
                    Cancel
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {availableScouts.map((scout) => (
                    <button
                      key={scout.id}
                      onClick={() => handleAddShoppingList(scout.id)}
                      className="flex items-center gap-2 p-3 bg-white border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {scout.first_name[0]}{scout.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-900">
                          {scout.first_name} {scout.last_name}
                        </p>
                        <p className="text-xs text-slate-600">{scout.patrol}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Shopping Lists Display */}
            <div className="space-y-4">
              {shoppingLists.map((list) => {
                const scout = scouts.find((s) => s.id === list.scout_id);
                const listTotal = list.items?.reduce((sum, item) => sum + (item.cost || 0), 0) || 0;

                return (
                  <div key={list.id} className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                    {/* List Header */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-300">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-bold text-slate-900">
                            {scout ? `${scout.first_name} ${scout.last_name}` : "Unknown Scout"}
                          </p>
                          <p className="text-xs text-slate-600">List Total: ${listTotal.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAddItem(list.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Item
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveShoppingList(list.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {list.items && list.items.length > 0 ? (
                        list.items.map((item, idx) => (
                          <div key={idx} className="flex gap-2 bg-white p-3 rounded-lg border border-slate-200">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                              <Input
                                placeholder="Item name"
                                value={item.name}
                                onChange={(e) => handleItemChange(list.id, idx, "name", e.target.value)}
                                className="border-slate-300"
                              />
                              <Input
                                placeholder="Quantity"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(list.id, idx, "quantity", e.target.value)}
                                className="border-slate-300"
                              />
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={item.cost}
                                  onChange={(e) => handleItemChange(list.id, idx, "cost", e.target.value)}
                                  className="pl-7 border-slate-300"
                                />
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveItem(list.id, idx)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 italic text-center py-4">
                          No items yet. Click "Add Item" to start.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {shoppingLists.length === 0 && (
                <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                  <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">No shopping lists yet</p>
                  <p className="text-sm text-slate-400">Click "Add Scout List" to create one</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              disabled={isLoading || !eventName}
            >
              {isLoading ? "Saving..." : expense ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}