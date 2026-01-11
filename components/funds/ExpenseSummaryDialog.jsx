import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DollarSign, ShoppingCart, User, Calendar, X } from "lucide-react";

function formatDate(dateString) {
  if (!dateString) return "No date set";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function ExpenseSummaryDialog({ open, onClose, expense, scouts, totalCost }) {
  if (!expense) return null;

  const shoppingLists = expense.shoppingLists || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{expense.eventName}</DialogTitle>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                {expense.eventDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(expense.eventDate)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span>{shoppingLists.length} Shopping Lists</span>
                </div>
              </div>
              {expense.description && (
                <p className="text-sm text-slate-600 mt-2">{expense.description}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Total Cost Banner */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-6 shadow-lg -mx-6 mt-4">
          <div className="flex items-center justify-center gap-4">
            <DollarSign className="w-12 h-12 text-white" />
            <div className="text-center text-white">
              <p className="text-sm opacity-90 mb-1">Total Event Cost</p>
              <p className="text-5xl font-bold">
                ${totalCost.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Shopping Lists Details - Scrollable */}
        <div className="flex-1 overflow-y-auto mt-6 -mx-6 px-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 sticky top-0 bg-white pt-2 pb-2">
            Shopping Lists Breakdown
          </h3>

          <div className="space-y-6">
            {shoppingLists.map((list) => {
              const scout = scouts.find((s) => s.id === list.scout_id);
              const listTotal = list.items?.reduce((sum, item) => sum + (item.cost || 0), 0) || 0;

              return (
                <div key={list.id} className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-5 border-2 border-slate-200 shadow-sm">
                  {/* List Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-300">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-slate-900">
                          {scout ? `${scout.first_name} ${scout.last_name}` : "Unknown Scout"}
                        </p>
                        <p className="text-sm text-slate-600">
                          {scout?.patrol || "No patrol"}
                        </p>
                      </div>
                    </div>
                    <div className="bg-red-100 rounded-xl px-4 py-2 border-2 border-red-300">
                      <p className="text-xs text-red-700 font-semibold mb-1">List Total</p>
                      <p className="text-2xl font-bold text-red-700">
                        ${listTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  {list.items && list.items.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-700 mb-3">
                        Items ({list.items.length})
                      </p>
                      {list.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-slate-200 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 text-base mb-1">
                              {item.name || "Unnamed item"}
                            </p>
                            {item.quantity && (
                              <p className="text-sm text-slate-600">
                                Quantity: <span className="font-medium">{item.quantity}</span>
                              </p>
                            )}
                          </div>
                          <div className="bg-slate-100 rounded-lg px-4 py-2 ml-4">
                            <p className="text-xl font-bold text-slate-900">
                              ${item.cost?.toFixed(2) || "0.00"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-slate-300">
                      <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500">No items in this list</p>
                    </div>
                  )}
                </div>
              );
            })}

            {shoppingLists.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No shopping lists created</p>
                <p className="text-sm text-slate-400 mt-1">Add shopping lists to track expenses</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-4 mt-4 -mx-6 px-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-600">
              <p className="font-semibold">Summary</p>
              <p className="mt-1">
                {shoppingLists.length} shopping list(s) with{" "}
                {shoppingLists.reduce((sum, list) => sum + (list.items?.length || 0), 0)} total items
              </p>
            </div>
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Close Summary
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}