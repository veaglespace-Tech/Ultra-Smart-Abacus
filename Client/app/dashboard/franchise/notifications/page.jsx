"use client";

import React, { useState, useEffect } from "react";
import { Bell, Info, Send, Trash2, Megaphone, ShieldAlert } from "lucide-react";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

import { useDispatch, useSelector } from "react-redux";
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  markReadOptimistic,
  markAllReadOptimistic
} from "@/store/notificationSlice";

export default function FranchiseNotificationsPage() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector((state) => state.notification);

  // Form states
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState("All");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    dispatch(fetchNotifications("FRANCHISE"));
  }, [dispatch]);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!title || !message) return;
    setSuccessMsg("");
    setErrorMsg("");

    const payload = {
      title: title,
      message,
      type: "GENERAL",
      recipientType: targetAudience === "All" ? "ALL" :
                     targetAudience === "Teachers" ? "TEACHERS" :
                     targetAudience === "Students" ? "STUDENTS" : "ALL"
    };

    try {
      await api.admin.createNotification(payload);
      setTitle("");
      setMessage("");
      setTargetAudience("All");
      setSuccessMsg("Broadcast sent successfully!");
      fetchNotifications();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg(err.message || "Failed to send notification");
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await api.admin.deleteNotification(id);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  // Filter notifications: Admin notices vs Franchise broadcasts
  const adminNotices = notifications.filter(n => n.createdBy !== user?.id);
  const myBroadcasts = notifications.filter(n => n.createdBy === user?.id);

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="gradient-text">ALERTS & BROADCASTS</span>
          </h2>
          <p className="text-xs text-slate-550 dark:text-slate-455 mt-0.5">Send custom updates to center students, teachers, or view system wide logs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Broadcast Sender Form */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 p-6 shadow-sm backdrop-blur-md h-fit">
          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3.5 mb-4 flex items-center gap-2">
            <Megaphone size={14} className="text-indigo-650 dark:text-indigo-400" />
            Publish Center Notice
          </h4>

          {successMsg && (
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-600 dark:text-emerald-400 mb-4 animate-fade-in flex items-center gap-1.5 font-bold">
              <span>✔</span>
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-xs text-rose-600 dark:text-rose-450 mb-4 animate-fade-in flex items-center gap-1.5 font-bold">
              <span>⚠</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 mb-1.5">
                Notice Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Center Holiday / Fee Reminders"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 mb-1.5">
                Target Audience
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="All">All Center Members</option>
                <option value="Teachers">Teachers Only</option>
                <option value="Students">Students Only</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 dark:text-slate-400 mb-1.5">
                Message Body *
              </label>
              <textarea
                required
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type the announcement details here..."
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] hover:opacity-95 text-white font-bold text-xs py-3 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-md shadow-[#FF6B2B]/25 btn-shine"
            >
              <Send size={12} />
              <span>Broadcast Announcement</span>
            </button>
          </form>
        </div>

        {/* History / Logs */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Admin Notifications Card (Separate small section) */}
          <div className="bg-white/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm backdrop-blur-md">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-indigo-600 dark:text-indigo-400" />
                Notices from Super Admin
              </h4>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    dispatch(markAllReadOptimistic());
                    dispatch(markAllNotificationsAsRead());
                  }}
                  className="bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50 text-[11px] font-bold px-2.5 py-1 rounded-xl hover:bg-orange-100 transition-all cursor-pointer"
                >
                  Mark All Read ({unreadCount})
                </button>
              )}
            </div>
            {loading ? (
              <p className="text-xs text-slate-400 font-medium py-1">Checking system updates...</p>
            ) : adminNotices.length === 0 ? (
              <p className="text-xs text-slate-400/80 font-bold py-2 flex items-center gap-1.5">
                <span>🔔</span>
                <span>No new notices from Super Admin.</span>
              </p>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {adminNotices.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => {
                      dispatch(markReadOptimistic(n.id));
                      dispatch(markNotificationAsRead(n.id));
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      !n.isRead 
                        ? "bg-amber-500/10 border-amber-500/40 text-slate-900 dark:text-white" 
                        : "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-100/50 dark:border-indigo-900/30"
                    }`}
                  >
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">{n.title}</h5>
                    <p className="text-xs text-slate-650 dark:text-slate-400 font-medium leading-relaxed mt-1">{n.message}</p>
                    <span className="text-[9px] text-slate-400 font-bold block pt-1.5">
                      Published on {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Franchise Notice Board History */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Bell size={14} className="text-slate-450" />
              Notice Board History
            </h4>

            {loading ? (
              <div className="text-center py-12 text-xs text-slate-400 dark:text-slate-500 font-bold">
                Loading notice history...
              </div>
            ) : myBroadcasts.length === 0 ? (
              <div className="border border-dashed border-slate-200 dark:border-slate-800 text-center py-16 text-xs text-slate-400 dark:text-slate-500 rounded-3xl bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm font-bold">
                <Bell size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2 animate-bounce" />
                <span>No notifications have been published.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {myBroadcasts.map((n) => (
                  <div
                    key={n.id}
                    className="bg-white/75 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4.5 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200 flex items-start justify-between gap-4"
                  >
                    <div className="flex gap-3.5">
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 shrink-0">
                        <Info size={16} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-black text-slate-900 dark:text-white text-xs tracking-tight">{n.title}</h5>
                          <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-450 px-2 py-0.5 rounded-md">
                            To: {n.recipientType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-655 dark:text-slate-400 font-medium leading-relaxed">{n.message}</p>
                        <span className="text-[9px] text-slate-400 font-bold block pt-1">
                          Published on {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "Unknown"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteNotification(n.id)}
                      className="text-slate-400 hover:text-rose-500 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0 transition-colors cursor-pointer"
                      title="Delete Notice"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
