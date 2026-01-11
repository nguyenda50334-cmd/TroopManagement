import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { LayoutDashboard, Users, Award, Calendar, TrendingUp, Shield, LogOut } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTroop } from "/context/TroopContext";

const navigationItems = [
  { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
  { title: "Scouts", url: "/app/scouts", icon: Users },
  { title: "Merit Badges", url: "/app/meritbadges", icon: Award },
  { title: "Events", url: "/app/events", icon: Calendar },
  { title: "Advancements", url: "/app/advancements", icon: TrendingUp },
  { title: "Funds", url: "/app/funds", icon: DollarSign },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeTroop, switchTroop, currentUser, isAdmin } = useTroop();
  const [userInitial, setUserInitial] = useState("L");

  useEffect(() => {
    console.log('Layout - currentUser changed:', currentUser);
    if (currentUser) {
      setUserInitial(currentUser.firstName?.[0] || "L");
    }
  }, [currentUser]);

  useEffect(() => {
    console.log('Layout - activeTroop changed:', activeTroop);
  }, [activeTroop]);

  const handleTroopChange = (troop) => {
    console.log('=== Troop Switch ===');
    console.log('Current user:', currentUser);
    console.log('Switching to troop:', troop);
    console.log('Is admin?', isAdmin);
    
    if (!isAdmin) {
      console.error('Non-admin tried to switch troops!');
      return;
    }
    
    // Update the troop in context and localStorage
    switchTroop(troop);
    
    // DO NOT reload - just let React re-render
    // The context will update and cascade to all components
    console.log('Troop switched successfully');
    console.log('===================');
  };

  const handleLogout = () => {
    // Clear ALL localStorage data on logout
    localStorage.removeItem('currentUser');
    localStorage.removeItem('activeTroop');
    navigate('/login');
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <Sidebar className="border-r border-slate-200 bg-white/95 backdrop-blur-sm" collapsible="offcanvas">
          <SidebarHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-amber-400" fill="currentColor">
                  <path d="M12 2L15.5 8.5L22 9.5L17 14.5L18 21L12 17.5L6 21L7 14.5L2 9.5L8.5 8.5L12 2Z" />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-xl text-slate-900">Troop Manager</h2>
                <p className="text-xs text-slate-500">Troop {activeTroop}</p>
              </div>
            </div>

            {/* Troop Switcher for Admin ONLY */}
            {isAdmin && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                  Active Troop
                </label>
                <Select value={activeTroop} onValueChange={handleTroopChange}>
                  <SelectTrigger className="w-full bg-white border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="714">Troop 714 (Boys)</SelectItem>
                    <SelectItem value="5714">Troop 5714 (Girls)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild className={`group relative overflow-hidden transition-all duration-300 rounded-xl mb-1 ${isActive ? "bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg" : "hover:bg-slate-100 text-slate-700"}`}>
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                            <span className="font-medium">{item.title}</span>
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 rounded-r" />}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}

                  {/* Admin Only - Approvals */}
                  {isAdmin && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild className={`group relative overflow-hidden transition-all duration-300 rounded-xl mb-1 ${location.pathname === "/app/admin/approvals" ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg" : "hover:bg-slate-100 text-slate-700"}`}>
                        <Link to="/app/admin/approvals" className="flex items-center gap-3 px-4 py-3">
                          <Shield className={`w-5 h-5 transition-transform duration-300 ${location.pathname === "/app/admin/approvals" ? "scale-110" : "group-hover:scale-110"}`} />
                          <span className="font-medium">Approvals</span>
                          {location.pathname === "/app/admin/approvals" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 rounded-r" />}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-4">
            <div className="space-y-3">
              {/* User Info */}
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-slate-900 font-bold text-sm">{userInitial}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {isAdmin ? "System Admin" : "Troop Leader"}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-700 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-10 md:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
                <h1 className="text-lg font-bold text-slate-900">Troop {activeTroop}</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-slate-900 font-bold text-xs">{userInitial}</span>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}