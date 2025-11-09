import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Shield } from "lucide-react";

export default function WaitingApproval() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear ALL localStorage on logout
    localStorage.removeItem('currentUser');
    localStorage.removeItem('activeTroop');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* Icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
            <Clock className="w-12 h-12 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Waiting for Admin Approval
          </h1>

          {/* Message */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold text-slate-900 mb-1">Admin Review Required</p>
                  <p className="text-sm text-slate-600">
                    Your leader account request is being reviewed by a system administrator. 
                    You will receive an email notification once your account has been approved.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-700">
              <strong>What happens next?</strong><br />
              Your account information has been submitted and is pending approval. 
              This typically takes 1-2 business days. Please check your email regularly for updates.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full border-2 border-blue-500 text-blue-700 hover:bg-blue-50"
            >
              Check Approval Status
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              Logout
            </Button>
          </div>

          {/* Contact */}
          <p className="text-xs text-slate-500 mt-6">
            Need help? Contact your troop leaders or email support@troop714.org
          </p>
        </div>
      </div>
    </div>
  );
}