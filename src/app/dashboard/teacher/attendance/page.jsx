// src/app/dashboard/teacher/attendance/page.jsx
"use client";
import React, { useState } from 'react';

export default function AttendanceFinalFrontend() {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  
  const [batches] = useState([
    { id: 'b1', name: 'Batch Alpha (Saturday)' },
    { id: 'b2', name: 'Batch Beta (Mon-Wed)' }
  ]);

  const [students, setStudents] = useState([
    { id: '101', name: 'Abhishek Kulkarni', isPresent: true, pages: 4, notes: 'Good calculation speed.' },
    { id: '102', name: 'Pranjal Patil', isPresent: true, pages: 7, notes: 'All formulas checked.' },
    { id: '103', name: 'Siddharth Joshi', isPresent: false, pages: 0, notes: 'Absent.' }
  ]);

  const toggleAttendance = (id) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        const nextPresent = !s.isPresent;
        return { ...s, isPresent: nextPresent, pages: nextPresent ? s.pages : 0 };
      }
      return s;
    }));
  };

  const downloadExcel = () => {
    let csv = "Roll No,Student Name,Attendance,Pages,Remarks\n";
    students.forEach(s => {
      csv += `${s.id},${s.name},${s.isPresent ? 'Present' : 'Absent'},${s.pages},${s.notes}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Attendance_${attendanceDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* FILTER BAR */}
      <div className="bg-[#fcfbfa] border border-[#e2dcd0] p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#8a9485] uppercase tracking-wide">Select Batch</span>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="bg-[#f4f0e6]/60 border border-[#e2dcd0] text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-[#4a5d4e] cursor-pointer"
            >
              <option value="">-- Choose Batch --</option>
              {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#8a9485] uppercase tracking-wide">Select Date</span>
            <input 
              type="date" 
              value={attendanceDate} 
              onChange={(e) => setAttendanceDate(e.target.value)} 
              className="bg-[#f4f0e6]/60 border border-[#e2dcd0] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#4a5d4e]"
            />
          </div>
        </div>

        {selectedBatch && (
          <div className="flex gap-2 w-full md:w-auto justify-end">
            <button 
              onClick={downloadExcel}
              className="bg-[#f4f0e6] hover:bg-[#eae5da] text-[#4a5d4e] border border-[#e2dcd0] text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              📥 Download Excel
            </button>
            <button className="bg-[#4a5d4e] hover:bg-[#3d4d40] text-[#fbfaf7] text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer">
              Save Attendance
            </button>
          </div>
        )}
      </div>

      {/* STUDENT DATA DISPLAY */}
      {selectedBatch ? (
        <div className="bg-[#fcfbfa] border border-[#e2dcd0] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e2dcd0] bg-[#f4f0e6] text-[11px] font-bold text-[#7a8475] tracking-wider">
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4">Student Info</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Pages Done</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2dcd0]/40 text-xs text-[#2c3539]">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-[#f5f2eb]/30 transition-colors">
                    
                    {/* Status Button */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleAttendance(student.id)}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-widest transition-colors border cursor-pointer ${
                          student.isPresent 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {student.isPresent ? '● PRESENT' : '○ ABSENT'}
                      </button>
                    </td>

                    {/* Meta info */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#1a202c] text-sm block">{student.name}</span>
                      <span className="text-[10px] text-[#8a9485] font-mono">Roll No: {student.id}</span>
                    </td>

                    {/* Numeric Tracking Column */}
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          disabled={!student.isPresent}
                          value={student.isPresent ? student.pages : 0} 
                          onChange={(e) => setStudents(prev => prev.map(s => s.id === student.id ? { ...s, pages: parseInt(e.target.value) || 0 } : s))}
                          className="w-12 bg-[#f4f0e6]/50 border border-[#e2dcd0] text-center rounded p-1 text-xs focus:outline-none"
                        />
                        <span className="text-[11px] text-[#8a9485]">pages</span>
                      </div>
                    </td>

                    {/* Configuration options */}
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={() => { setCurrentStudent(student); setIsPopupOpen(true); }}
                        className="text-[11px] bg-white hover:bg-[#f4f0e6] text-[#4a5d4e] border border-[#e2dcd0] px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer"
                      >
                        Edit Profile
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-[#e2dcd0] text-center py-12 text-xs text-[#8a9485] rounded-xl bg-[#fcfbfa]">
          Please select a batch from the dropdown filter menu above.
        </div>
      )}

      {/* REUSABLE LIGHT MODAL POP-UP */}
      {isPopupOpen && currentStudent && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#fbfaf7] border border-[#e2dcd0] w-full max-w-sm rounded-xl p-5 space-y-4 shadow-lg animate-fade-in">
            
            <div className="flex justify-between items-center border-b border-[#e2dcd0] pb-2">
              <div>
                <h3 className="font-bold text-[#1a202c]">Student Profile View</h3>
                <p className="text-[10px] text-[#8a9485]">ID Ref: {currentStudent.id}</p>
              </div>
              <button onClick={() => setIsPopupOpen(false)} className="text-[#8a9485] hover:text-black font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="block text-[10px] font-bold text-[#8a9485] mb-1 uppercase tracking-wider">Student Name</span>
                <p className="font-bold text-[#1a202c] bg-[#f4f0e6]/40 p-2 rounded-lg border border-[#e2dcd0]">{currentStudent.name}</p>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-[#8a9485] mb-1 uppercase tracking-wider">Teacher Remarks</span>
                <textarea 
                  rows="2"
                  value={currentStudent.notes}
                  onChange={(e) => setStudents(prev => prev.map(s => s.id === currentStudent.id ? { ...s, notes: e.target.value } : s))}
                  className="w-full bg-white border border-[#e2dcd0] rounded-lg p-2 focus:outline-none focus:border-[#4a5d4e] text-xs"
                  placeholder="Enter remarks..."
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-[#e2dcd0]">
              <button 
                onClick={() => setIsPopupOpen(false)}
                className="bg-[#f4f0e6] text-[#4a5d4e] text-xs font-bold px-3 py-2 rounded-lg border border-[#e2dcd0] cursor-pointer"
              >
                Back
              </button>
              <button 
                onClick={() => setIsPopupOpen(false)}
                className="bg-[#4a5d4e] text-[#fbfaf7] text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
              >
                Save Changes
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}