import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Crown, ChevronDown, User } from "lucide-react";
import { userApi } from "../../api/userApi";
import type { UserProfile } from "../../api/userApi";

const TopNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    userApi
      .getMe()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoadingProfile(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

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
    <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6 z-50 shrink-0">
      {}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-700 transition-colors">
          <span className="text-white font-bold text-xs leading-none">PM</span>
        </div>
        <span className="text-lg font-bold text-gray-900 tracking-tight group-hover:text-emerald-700 transition-colors">
          PM System
        </span>
      </Link>

      {}
      <div className="flex items-center gap-3">
        {}
        {profile?.role === "ADMIN" && (
          <Link
            to="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Crown className="h-4 w-4" />
            Админ-панель
          </Link>
        )}

        {}
        <div className="relative" ref={dropdownRef}>
          {loadingProfile ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl animate-pulse">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <div className="space-y-1.5 hidden sm:block">
                <div className="h-3 bg-gray-200 rounded w-24" />
                <div className="h-2.5 bg-gray-100 rounded w-16" />
              </div>
            </div>
          ) : profile ? (
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              {}
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0 select-none">
                {initials}
              </div>
              {}
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 leading-tight truncate max-w-[120px]">
                  {fullName || profile.email}
                </p>
                <p className="text-xs text-gray-400 truncate max-w-[120px]">
                  {profile.email}
                </p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
          ) : null}

          {}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fadeIn">
              {}
              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="h-4 w-4 text-gray-400" />
                Мой профиль
              </Link>

              <div className="my-1 border-t border-gray-100" />

              {}
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
