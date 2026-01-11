import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ShoppingCart, Calendar, DollarSign } from "lucide-react";

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ExpenseCard({ expense, scouts, onEdit, onDelete }) {
  const shoppingLists = expense.shoppingLists || [];
  
  const totalCost = shoppingLists.reduce((sum, list) => {
    const listTotal = list.items?.reduce((itemSum, item) => itemSum + (item.cost || 0), 0) || 0;
    return sum + listTotal;
  }, 0);

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
      <div className="h-2 bg-gradient-to-r from-orange-400 to-red-500" />
      
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-900">{expense.eventName}</h3>
                {expense.eventDate && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(expense.eventDate)}</span>
                  </div>
                )}
              </div>
            </div>
            {expense.description && (
              <p className="text-sm text-slate-600 ml-15">{expense.description}</p>
            )}
          </div>
        </div>

        {/* Total Cost Banner */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-slate-600">Total Event Cost</p>
                <p className="text-3xl font-bold text-red-600">
                  ${totalCost.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-600">Shopping Lists</p>
              <p className="text-2xl font-bold text-slate-900">{shoppingLists.length}</p>
            </div>
          </div>
        </div>

        {/* Shopping Lists */}
        {shoppingLists.length > 0 && (
          <div className="space-y-3 mb-4">
            <p className="text-sm font-semibold text-slate-700">Shopping Lists:</p>
            {shoppingLists.map((list) => {
              const scout = scouts.find((s) => s.id === list.scout_id);
              const listTotal = list.items?.reduce((sum, item) => sum + (item.cost || 0), 0) || 0;
              
              return (
                <div key={list.id} className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {scout?.first_name?.[0] || "?"}{scout?.last_name?.[0] || "?"}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-900">
                        {scout ? `${scout.first_name} ${scout.last_name}` : "Unknown Scout"}
                      </p>
                    </div>
                    <p className="font-bold text-red-600">${listTotal.toFixed(2)}</p>
                  </div>
                  
                  {list.items && list.items.length > 0 && (
                    <div className="space-y-2">
                      {list.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm bg-white p-2 rounded">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{item.name}</p>
                            {item.quantity && (
                              <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                            )}
                          </div>
                          <p className="font-semibold text-slate-700">${item.cost?.toFixed(2) || "0.00"}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {(!list.items || list.items.length === 0) && (
                    <p className="text-sm text-slate-500 italic">No items added yet</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {shoppingLists.length === 0 && (
          <div className="text-center py-6 bg-slate-50 rounded-lg mb-4">
            <p className="text-slate-500 text-sm">No shopping lists created yet</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-slate-200">
          <Button
            onClick={() => onEdit(expense)}
            variant="outline"
            size="sm"
            className="flex-1 border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
          >
            <Edit className="w-3 h-3 mr-2" />
            Edit
          </Button>
          <Button
            onClick={() => onDelete(expense.id)}
            variant="outline"
            size="sm"
            className="border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
          >
            <Trash2 className="w-3 h-3 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}