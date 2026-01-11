import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, DollarSign } from "lucide-react";

export default function DivideEquallyDialog({ open, onClose, onSave, accountCount, isLoading }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    
    if (!numAmount || numAmount === 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!description.trim()) {
      alert("Please enter a description");
      return;
    }

    onSave({
      amount: numAmount,
      description: description.trim(),
    });

    // Reset
    setAmount("");
    setDescription("");
  };

  const handleClose = () => {
    setAmount("");
    setDescription("");
    onClose();
  };

  const amountPerAccount = amount ? (parseFloat(amount) || 0) : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Divide Funds Equally</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info Card */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <p className="font-semibold text-slate-900">
                {accountCount} Active Accounts
              </p>
            </div>
            <p className="text-sm text-slate-600">
              The amount you enter will be divided equally among all {accountCount} scout accounts.
            </p>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="mb-2 block">
              Description
            </Label>
            <Input
              id="description"
              placeholder="e.g., Cakepop Fundraiser, Car Wash Earnings"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-slate-300"
            />
          </div>

          {/* Amount Input */}
          <div>
            <Label htmlFor="amount" className="mb-2 block">
              Total Amount to Distribute
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
                $
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-lg border-slate-300"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Use negative values to subtract funds from all accounts
            </p>
          </div>

          {/* Preview */}
          {amount && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-slate-600 mb-1">Amount Per Account</p>
                  <p className={`text-3xl font-bold ${amountPerAccount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {amountPerAccount >= 0 ? '+' : ''}${Math.abs(amountPerAccount).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-xs text-slate-600">
                  Each of the {accountCount} scouts will receive{' '}
                  <span className="font-bold text-slate-900">
                    {amountPerAccount >= 0 ? '+' : ''}${Math.abs(amountPerAccount).toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              disabled={isLoading || !amount || !description}
            >
              {isLoading ? "Processing..." : "Distribute Funds"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}