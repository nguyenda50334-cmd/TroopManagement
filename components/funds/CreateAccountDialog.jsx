import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, DollarSign } from "lucide-react";

export default function CreateAccountDialog({ open, onClose, onSave, scouts, existingAccounts, account, isLoading }) {
  const [selectedScout, setSelectedScout] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showScoutList, setShowScoutList] = useState(true);

  useEffect(() => {
    if (account) {
      setSelectedScout(account.scout_id);
      setTransactions(account.transactions || []);
      setShowScoutList(false);
    } else {
      setSelectedScout(null);
      setTransactions([]);
      setShowScoutList(true);
    }
  }, [account, open]);

  const availableScouts = scouts.filter(
    (scout) => !existingAccounts.some((acc) => acc.scout_id === scout.id) || (account && scout.id === account.scout_id)
  );

  const handleAddTransaction = () => {
    setTransactions([
      ...transactions,
      {
        id: `temp-${Date.now()}`,
        description: "",
        amount: 0,
        date: new Date().toISOString(),
      },
    ]);
  };

  const handleRemoveTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const handleTransactionChange = (id, field, value) => {
    setTransactions(
      transactions.map((t) =>
        t.id === id
          ? { ...t, [field]: field === "amount" ? parseFloat(value) || 0 : value }
          : t
      )
    );
  };

  const handleSubmit = () => {
    if (!selectedScout) {
      alert("Please select a scout");
      return;
    }

    onSave({
      scout_id: selectedScout,
      transactions: transactions.filter(t => t.description.trim() !== ""),
    });
  };

  const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{account ? "Edit Account" : "Create New Account"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Scout Selection */}
          {showScoutList && !account ? (
            <div>
              <Label className="mb-3 block">Select Scout</Label>
              <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                {availableScouts.map((scout) => (
                  <button
                    key={scout.id}
                    onClick={() => {
                      setSelectedScout(scout.id);
                      setShowScoutList(false);
                    }}
                    className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold">
                        {scout.first_name[0]}{scout.last_name[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        {scout.first_name} {scout.last_name}
                      </p>
                      <p className="text-sm text-slate-600">{scout.patrol}</p>
                    </div>
                  </button>
                ))}
                {availableScouts.length === 0 && (
                  <p className="text-center text-slate-500 py-8">
                    All scouts already have accounts
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Selected Scout Display */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold">
                        {scouts.find(s => s.id === selectedScout)?.first_name[0]}
                        {scouts.find(s => s.id === selectedScout)?.last_name[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        {scouts.find(s => s.id === selectedScout)?.first_name}{" "}
                        {scouts.find(s => s.id === selectedScout)?.last_name}
                      </p>
                      <p className="text-sm text-slate-600">
                        {scouts.find(s => s.id === selectedScout)?.patrol}
                      </p>
                    </div>
                  </div>
                  {!account && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedScout(null);
                        setShowScoutList(true);
                      }}
                      className="text-blue-700"
                    >
                      Change
                    </Button>
                  )}
                </div>
              </div>

              {/* Current Balance */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Current Balance</p>
                    <p className={`text-3xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${totalBalance.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transactions */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label>Transactions</Label>
                  <Button
                    size="sm"
                    onClick={handleAddTransaction}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Transaction
                  </Button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex gap-3 p-4 bg-slate-50 rounded-xl border-2 border-slate-200"
                    >
                      <div className="flex-1 space-y-3">
                        <Input
                          placeholder="Description (e.g., Funds from Cakepop Fundraiser)"
                          value={transaction.description}
                          onChange={(e) =>
                            handleTransactionChange(transaction.id, "description", e.target.value)
                          }
                          className="border-slate-300"
                        />
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <Label className="text-xs mb-1 block">Amount</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                $
                              </span>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={transaction.amount}
                                onChange={(e) =>
                                  handleTransactionChange(transaction.id, "amount", e.target.value)
                                }
                                className="pl-7 border-slate-300"
                              />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              Use negative values to subtract funds
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTransaction(transaction.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      No transactions yet. Click "Add Transaction" to get started.
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
                  disabled={isLoading || !selectedScout}
                >
                  {isLoading ? "Saving..." : account ? "Update Account" : "Create Account"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}