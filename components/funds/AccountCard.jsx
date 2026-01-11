import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, DollarSign, TrendingUp, TrendingDown } from "lucide-react";

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AccountCard({ account, scouts, onEdit, onDelete, onUpdate }) {
  const scout = scouts.find((s) => s.id === account.scout_id);
  
  const transactions = account.transactions || [];
  const totalFunds = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  const positiveTransactions = transactions.filter(t => t.amount > 0);
  const negativeTransactions = transactions.filter(t => t.amount < 0);

  return (
    <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden">
      <div className={`h-2 ${totalFunds >= 0 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-500'}`} />
      
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {scout?.first_name?.[0] || "?"}{scout?.last_name?.[0] || "?"}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                {scout ? `${scout.first_name} ${scout.last_name}` : "Unknown Scout"}
              </h3>
              <p className="text-xs text-slate-500">
                {scout?.patrol || "Unassigned"}
              </p>
            </div>
          </div>
        </div>

        {/* Total Balance */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 mb-4">
          <p className="text-xs text-slate-600 mb-1">Total Balance</p>
          <div className="flex items-baseline gap-2">
            <p className={`text-3xl font-bold ${totalFunds >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(totalFunds).toFixed(2)}
            </p>
            {totalFunds < 0 && <span className="text-sm text-red-500 font-medium">(deficit)</span>}
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <p className="text-xs text-green-700 font-medium">Income</p>
            </div>
            <p className="text-lg font-bold text-green-800">
              +${positiveTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <p className="text-xs text-red-700 font-medium">Expenses</p>
            </div>
            <p className="text-lg font-bold text-red-800">
              ${Math.abs(negativeTransactions.reduce((sum, t) => sum + t.amount, 0)).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-600 mb-2">Recent Transactions</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {transactions
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5)
                .map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-start justify-between p-2 bg-slate-50 rounded-lg text-xs"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-medium text-slate-900 truncate">
                        {transaction.description}
                      </p>
                      <p className="text-slate-500 text-[10px]">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                    <p
                      className={`font-bold whitespace-nowrap ${
                        transaction.amount >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.amount >= 0 ? "+" : ""}${transaction.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => onEdit(account)}
            variant="outline"
            size="sm"
            className="flex-1 border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
          >
            <Edit className="w-3 h-3 mr-2" />
            Edit
          </Button>
          <Button
            onClick={() => onDelete(account.id)}
            variant="outline"
            size="sm"
            className="border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}