import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  AlertCircle,
  LogOut,
  Crown,
  Package,
} from "lucide-react";
import { userApi } from "../../api/userApi";
import type { UserProfile } from "../../api/userApi";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    userApi
      .getMe()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoadingProfile(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  const navItems = [
    {
      name: "Проекты",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5 mr-3" />,
    },
  ];

  const initials = profile
    ? [profile.firstName, profile.lastName]
        .filter(Boolean)
        .map((s) => s![0].toUpperCase())
        .join("")
    : "?";

  const fullName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(" ")
    : "";

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full shadow-xl">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight text-white/90">
          PM System
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                isActive
                  ? "bg-emerald-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}

        {}
        {profile?.role === "ADMIN" && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                isActive
                  ? "bg-purple-600 text-white"
                  : "text-purple-300 hover:bg-purple-900/50 hover:text-purple-100"
              }`
            }
          >
            <Crown className="h-5 w-5 mr-3" />
            Админ-панель
          </NavLink>
        )}
      </nav>

      {}
      <div className="px-4 pb-2">
        {loadingProfile ? (

          <div className="flex items-center gap-3 px-2 py-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-700 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-700 rounded-full w-3/4" />
              <div className="h-2.5 bg-gray-800 rounded-full w-1/2" />
            </div>
          </div>
        ) : profile ? (
          <Link
            to="/profile"
            className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-gray-800 transition-colors"
            title="Перейти в настройки профиля"
          >
            {}
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0 select-none">
              {initials}
            </div>
            {}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">
                {fullName || profile.email}
              </p>
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {profile.email}
              </p>
            </div>
          </Link>
        ) : null}
      </div>

      {}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-4 py-3 text-sm font-medium text-gray-300 rounded-xl hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Выйти
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
