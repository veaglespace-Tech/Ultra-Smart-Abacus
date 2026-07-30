// src/app/dashboard/teacher/batches/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, CalendarDays, Plus, Search, BookOpen, Clock } from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function TeacherBatchesPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const res = await api.batches.getAll();
        if (res && res.success) {
          const mapped = res.data.map(dbBatch => {
            let extra = {};
            try {
              extra = JSON.parse(dbBatch.description || '{}');
            } catch (e) {
              extra = {
                slot: "TBD",
                teacher: "TBD",
                room: dbBatch.description || "Room A"
              };
            }
            const count = dbBatch.studentCount !== undefined ? dbBatch.studentCount : (Array.isArray(dbBatch.students) ? dbBatch.students.length : (dbBatch._count?.students || 0));
            return {
              id: dbBatch.id,
              name: dbBatch.name || `Batch - ${dbBatch.code}`,
              level: dbBatch.level || "Level 1",
              students: count,
              timing: extra.slot || "Saturday 09:00 AM - 10:30 AM",
              room: extra.room || "Room A",
              teacher: extra.teacher || "TBD",
              status: count >= (dbBatch.maxStudents || 15) ? "Full" : "Active"
            };
          });
          setBatches(mapped);
        }
      } catch (error) {
        console.error("Failed to load teacher batches", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          batch.level.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="gradient-text">MY BATCH ALLOCATIONS</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">Manage, track, and record attendance for your assigned learning cohorts.</p>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm w-full">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl w-full sm:w-80">
          <Search size={14} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search batch or curriculum..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs focus:outline-none w-full placeholder-slate-400 text-slate-700 dark:text-slate-200"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button className="bg-gradient-to-r from-[#2D1B69] via-[#FF6B2B] to-[#FFCA28] hover:opacity-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#FF6B2B]/25 btn-shine">
            <Plus size={14} />
            <span>Request Batch</span>
          </button>
        </div>
      </div>

      {/* BATCHES TABLE CONTAINER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-450">
                <th className="py-4 px-6">Batch Name</th>
                <th className="py-4 px-6">Curriculum Track</th>
                <th className="py-4 px-6">Schedule Time</th>
                <th className="py-4 px-6">Students Assigned</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-350">
              {filteredBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-150">
                  {/* Name */}
                  <td className="py-4 px-6">
                    <span className="font-bold text-slate-900 dark:text-slate-50 text-sm block">{batch.name}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">ID: BTCH-00{batch.id} • {batch.room}</span>
                  </td>
                  
                  {/* Level */}
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 bg-primary/5 text-primary dark:bg-primary-light/20 dark:text-cream px-2.5 py-1 rounded-lg text-[10px] font-bold border border-primary/10 dark:border-primary-light/35">
                      <BookOpen size={10} />
                      {batch.level}
                    </span>
                  </td>

                  {/* Time */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                      <Clock size={12} className="text-slate-400" />
                      {batch.timing}
                    </div>
                  </td>

                  {/* Students */}
                  <td className="py-4 px-6">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{batch.students}</span>
                    <span className="text-slate-450 font-normal"> students</span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                      batch.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/30 dark:text-emerald-450 dark:border-emerald-900/40'
                        : 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/30 dark:text-amber-450 dark:border-amber-900/40'
                    }`}>
                      {batch.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Link 
                        href={`/dashboard/teacher/progress?batch=${encodeURIComponent(batch.name)}`}
                        className="inline-flex items-center gap-1 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </Link>
                      <Link
                        href={`/dashboard/teacher/attendance?batch=${encodeURIComponent(batch.name)}`}
                        className="inline-flex items-center gap-1 bg-primary/5 hover:bg-primary/10 dark:bg-primary-light/20 dark:hover:bg-primary-light/30 border border-primary/20 dark:border-primary-light/35 text-primary dark:text-cream px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                      >
                        <CalendarDays size={12} />
                        <span>Attendance</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBatches.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-400 font-semibold border-t border-slate-100 dark:border-slate-800">
            No cohorts found matching your search.
          </div>
        )}
      </div>

    </div>
  );
}