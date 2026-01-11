import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, Users, ShoppingCart, TrendingUp } from "lucide-react";
import { useTroop } from "../context/TroopContext";
import AccountCard from "../components/funds/AccountCard";
import CreateAccountDialog from "../components/funds/CreateAccountDialog";
import DivideEquallyDialog from "../components/funds/DivideEquallyDialog";
import ExpenseCard from "../components/funds/ExpenseCard";
import CreateExpenseDialog from "../components/funds/CreateExpenseDialog";

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
  return json.record;
};

export default function Funds() {
  const { activeTroop } = useTroop();
  const [activeTab, setActiveTab] = useState("accounts");
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showDivideDialog, setShowDivideDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);

  const queryClient = useQueryClient();

  const { data: binData = {}, isLoading } = useQuery({
    queryKey: ["jsonbin", activeTroop],
    queryFn: () => fetchJSONBin(),
  });

  const allScouts = binData.scouts || [];
  const allAccounts = binData.fundAccounts || [];
  const allExpenses = binData.fundExpenses || [];

  const scouts = allScouts.filter((s) => s.troop === activeTroop);
  const accounts = allAccounts.filter((a) => a.troop === activeTroop);
  const expenses = allExpenses.filter((e) => e.troop === activeTroop);

  // Calculate total troop funds
  const totalTroopFunds = accounts.reduce((sum, account) => {
    const accountTotal = account.transactions?.reduce((total, t) => total + t.amount, 0) || 0;
    return sum + accountTotal;
  }, 0);

  // Create account mutation
  const createAccountMutation = useMutation({
    mutationFn: async (accountData) => {
      const bin = await fetchJSONBin();
      const newAccount = {
        id: `account-${Date.now()}`,
        troop: activeTroop,
        scout_id: accountData.scout_id,
        transactions: accountData.transactions || [],
        created_at: new Date().toISOString(),
      };
      const updatedAccounts = [...(bin.fundAccounts || []), newAccount];
      return fetchJSONBin("PUT", { ...bin, fundAccounts: updatedAccounts });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jsonbin"] });
      setShowAccountDialog(false);
      setEditingAccount(null);
    },
  });

  // Update account mutation
  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const bin = await fetchJSONBin();
      const updatedAccounts = (bin.fundAccounts || []).map((a) =>
        a.id === id ? { ...a, ...data } : a
      );
      return fetchJSONBin("PUT", { ...bin, fundAccounts: updatedAccounts });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jsonbin"] });
      setEditingAccount(null);
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (accountId) => {
      const bin = await fetchJSONBin();
      const updatedAccounts = (bin.fundAccounts || []).filter((a) => a.id !== accountId);
      return fetchJSONBin("PUT", { ...bin, fundAccounts: updatedAccounts });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jsonbin"] });
    },
  });

  // Divide equally mutation
  const divideEquallyMutation = useMutation({
    mutationFn: async ({ amount, description }) => {
      const bin = await fetchJSONBin();
      const troopAccounts = (bin.fundAccounts || []).filter((a) => a.troop === activeTroop);
      
      const updatedAccounts = (bin.fundAccounts || []).map((account) => {
        if (account.troop === activeTroop) {
          const newTransaction = {
            id: `trans-${Date.now()}-${Math.random()}`,
            amount: parseFloat(amount),
            description: description,
            date: new Date().toISOString(),
          };
          return {
            ...account,
            transactions: [...(account.transactions || []), newTransaction],
          };
        }
        return account;
      });

      return fetchJSONBin("PUT", { ...bin, fundAccounts: updatedAccounts });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jsonbin"] });
      setShowDivideDialog(false);
    },
  });

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData) => {
      const bin = await fetchJSONBin();
      const newExpense = {
        id: `expense-${Date.now()}`,
        troop: activeTroop,
        ...expenseData,
        created_at: new Date().toISOString(),
      };
      const updatedExpenses = [...(bin.fundExpenses || []), newExpense];
      return fetchJSONBin("PUT", { ...bin, fundExpenses: updatedExpenses });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jsonbin"] });
      setShowExpenseDialog(false);
      setEditingExpense(null);
    },
  });

  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const bin = await fetchJSONBin();
      const updatedExpenses = (bin.fundExpenses || []).map((e) =>
        e.id === id ? { ...e, ...data } : e
      );
      return fetchJSONBin("PUT", { ...bin, fundExpenses: updatedExpenses });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jsonbin"] });
      setShowExpenseDialog(false);
      setEditingExpense(null);
    },
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId) => {
      const bin = await fetchJSONBin();
      const updatedExpenses = (bin.fundExpenses || []).filter((e) => e.id !== expenseId);
      return fetchJSONBin("PUT", { ...bin, fundExpenses: updatedExpenses });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jsonbin"] });
    },
  });

  const handleDeleteAccount = (id) => {
    if (confirm("Are you sure you want to delete this account? All transaction history will be lost.")) {
      deleteAccountMutation.mutate(id);
    }
  };

  const handleDeleteExpense = (id) => {
    if (confirm("Are you sure you want to delete this expense event?")) {
      deleteExpenseMutation.mutate(id);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Funds Management</h1>
            <p className="text-slate-600">Track accounts and expenses for Troop {activeTroop}</p>
          </div>
        </div>

        {/* Total Troop Funds Banner */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <DollarSign className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm opacity-90 mb-1">Total Troop Funds</p>
                <p className="text-4xl font-bold">
                  ${totalTroopFunds.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">{accounts.length} Active Accounts</p>
              <p className="text-2xl font-semibold mt-1">
                ${accounts.length > 0 ? (totalTroopFunds / accounts.length).toFixed(2) : "0.00"} avg
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="inline-flex bg-white rounded-xl shadow-lg p-1">
            <button
              onClick={() => setActiveTab("accounts")}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === "accounts"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Users className="w-4 h-4" />
              Accounts
            </button>
            <button
              onClick={() => setActiveTab("expenses")}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === "expenses"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Expenses
            </button>
          </div>
        </div>

        {/* Accounts Tab */}
        {activeTab === "accounts" && (
          <div>
            <div className="flex justify-end gap-3 mb-6">
              <Button
                onClick={() => setShowDivideDialog(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg"
                disabled={accounts.length === 0}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Divide Equally
              </Button>
              <Button
                onClick={() => {
                  setEditingAccount(null);
                  setShowAccountDialog(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Account
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  scouts={scouts}
                  onEdit={(account) => {
                    setEditingAccount(account);
                    setShowAccountDialog(true);
                  }}
                  onDelete={handleDeleteAccount}
                  onUpdate={(id, data) => updateAccountMutation.mutate({ id, data })}
                />
              ))}
            </div>

            {accounts.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">No fund accounts created yet</p>
                <Button
                  onClick={() => setShowAccountDialog(true)}
                  variant="outline"
                  className="border-blue-500 text-blue-700 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Account
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === "expenses" && (
          <div>
            <div className="flex justify-end mb-6">
              <Button
                onClick={() => {
                  setEditingExpense(null);
                  setShowExpenseDialog(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Expense Event
              </Button>
            </div>

            <div className="space-y-6">
              {expenses
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    scouts={scouts}
                    onEdit={(expense) => {
                      setEditingExpense(expense);
                      setShowExpenseDialog(true);
                    }}
                    onDelete={handleDeleteExpense}
                    onUpdate={(id, data) => updateExpenseMutation.mutate({ id, data })}
                  />
                ))}
            </div>

            {expenses.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">No expense events tracked yet</p>
                <Button
                  onClick={() => setShowExpenseDialog(true)}
                  variant="outline"
                  className="border-blue-500 text-blue-700 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Expense Event
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Dialogs */}
        <CreateAccountDialog
          open={showAccountDialog}
          onClose={() => {
            setShowAccountDialog(false);
            setEditingAccount(null);
          }}
          onSave={(data) => {
            if (editingAccount) {
              updateAccountMutation.mutate({ id: editingAccount.id, data });
            } else {
              createAccountMutation.mutate(data);
            }
          }}
          scouts={scouts}
          existingAccounts={accounts}
          account={editingAccount}
          isLoading={createAccountMutation.isPending || updateAccountMutation.isPending}
        />

        <DivideEquallyDialog
          open={showDivideDialog}
          onClose={() => setShowDivideDialog(false)}
          onSave={(data) => divideEquallyMutation.mutate(data)}
          accountCount={accounts.length}
          isLoading={divideEquallyMutation.isPending}
        />

        <CreateExpenseDialog
          open={showExpenseDialog}
          onClose={() => {
            setShowExpenseDialog(false);
            setEditingExpense(null);
          }}
          onSave={(data) => {
            if (editingExpense) {
              updateExpenseMutation.mutate({ id: editingExpense.id, data });
            } else {
              createExpenseMutation.mutate(data);
            }
          }}
          scouts={scouts}
          expense={editingExpense}
          isLoading={createExpenseMutation.isPending || updateExpenseMutation.isPending}
        />
      </div>
    </div>
  );
}