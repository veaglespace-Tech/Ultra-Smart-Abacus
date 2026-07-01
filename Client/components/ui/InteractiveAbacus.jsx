"use client";

import React, { useState, useEffect, useRef } from "react";

// Colors for the beads matching the reference image
const ROW_CONFIG = [
  { label: "100,000s", multiplier: 100000, colorClass: "bg-[radial-gradient(circle_at_30%_30%,#ff8a95,#f65c6b_60%,#b32b38)]", name: "Red" },
  { label: "10,000s",  multiplier: 10000,  colorClass: "bg-[radial-gradient(circle_at_30%_30%,#ffe27c,#fcbf24_60%,#b27d00)]", name: "Gold" },
  { label: "1,000s",   multiplier: 1000,   colorClass: "bg-[radial-gradient(circle_at_30%_30%,#f07fa6,#d84273_60%,#91163f)]", name: "Magenta" },
  { label: "100s",     multiplier: 100,    colorClass: "bg-[radial-gradient(circle_at_30%_30%,#ff7396,#e22b5c_60%,#98092f)]", name: "Rose" },
  { label: "10s",      multiplier: 10,     colorClass: "bg-[radial-gradient(circle_at_30%_30%,#ff9d75,#fd6b35_60%,#bc3502)]", name: "Orange" },
  { label: "1s",       multiplier: 1,      colorClass: "bg-[radial-gradient(circle_at_30%_30%,#d39ed1,#a66fa4_60%,#693a67)]", name: "Purple" }
];

export default function InteractiveAbacus() {
  // State for how many beads are on the LEFT in each row (from index 0 to 5)
  // Initially, all 5 beads are on the left, meaning value is 0.
  const [rowStates, setRowStates] = useState([0, 0, 0, 0, 0, 0]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mode, setMode] = useState("free"); // "free" or "challenge"
  
  // Challenge mode states
  const [targetNumber, setTargetNumber] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const canvasRef = useRef(null);
  const confettiAnimationRef = useRef(null);
  
  // Calculate total value
  // Active beads are the ones slid to the RIGHT.
  // Number of beads on the right is: 5 - beadsOnLeft
  const calculateTotal = () => {
    return rowStates.reduce((sum, leftCount, idx) => {
      const rightCount = 5 - leftCount;
      return sum + rightCount * ROW_CONFIG[idx].multiplier;
    }, 0);
  };
  
  const totalValue = calculateTotal();

  // Web Audio procedural clack sound
  const playClack = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      // Wooden impact resonance filter
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1100 + Math.random() * 200; // slightly randomized wood pitch
      filter.Q.value = 4;
      
      // Triangle wave for low-mid wood impact body
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.03);
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.035);
      
      // High-pass white noise burst for the sharp plastic/wooden contact click
      const bufferSize = ctx.sampleRate * 0.015; // 15ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "highpass";
      noiseFilter.frequency.value = 3500;
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + 0.012);
      
      // Connect nodes
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      
      osc.start();
      noise.start();
      
      osc.stop(ctx.currentTime + 0.04);
      noise.stop(ctx.currentTime + 0.04);
    } catch (e) {
      console.warn("Audio Context error: ", e);
    }
  };

  // Reset all beads to the left (Value = 0)
  const resetAbacus = () => {
    setRowStates([5, 5, 5, 5, 5, 5]); // All 5 on the left
    playClack();
  };

  // Set all beads to the right (Max value)
  const setAllRight = () => {
    setRowStates([0, 0, 0, 0, 0, 0]); // 0 on left = all 5 on right
    playClack();
  };

  // Generate target number for Challenge Mode
  // Since we have 5 beads per row, each row's active beads can be 0 to 5.
  // So the target digits (in base 10) must be between 0 and 5 inclusive.
  const generateNewChallenge = () => {
    let num = 0;
    let multiplier = 1;
    for (let i = 0; i < 6; i++) {
      const digit = Math.floor(Math.random() * 6); // 0 to 5
      num += digit * multiplier;
      multiplier *= 10;
    }
    // Avoid target of 0
    if (num === 0) num = 5;
    
    setTargetNumber(num);
    setIsSuccess(false);
  };

  // Handle bead clicking/sliding
  const handleBeadClick = (rowIndex, beadIndex) => {
    const currentLeftCount = rowStates[rowIndex];
    let newLeftCount;

    if (beadIndex < currentLeftCount) {
      // Bead is on the left, slide it (and any beads to its right on the left) to the right.
      // The clicked bead index becomes the new left count.
      newLeftCount = beadIndex;
    } else {
      // Bead is on the right, slide it (and any beads to its left on the right) to the left.
      // The clicked bead index + 1 becomes the new left count.
      newLeftCount = beadIndex + 1;
    }

    const newRowStates = [...rowStates];
    newRowStates[rowIndex] = newLeftCount;
    setRowStates(newRowStates);
    playClack();
  };

  // Start challenge mode
  useEffect(() => {
    if (mode === "challenge") {
      generateNewChallenge();
    } else {
      setIsSuccess(false);
    }
  }, [mode]);

  // Check victory condition
  useEffect(() => {
    if (mode === "challenge" && totalValue === targetNumber && targetNumber !== 0) {
      setIsSuccess(true);
      triggerConfetti();
    } else {
      setIsSuccess(false);
    }
  }, [totalValue, targetNumber, mode]);

  // Canvas confetti animation
  const triggerConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // Set canvas dimensions
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    
    const particles = [];
    const colors = ["#F65C6B", "#FCBF24", "#D84273", "#E22B5C", "#FD6B35", "#A66FA4", "#3B82F6", "#10B981"];
    
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -50,
        r: Math.random() * 6 + 4,
        d: Math.random() * canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5
      });
    }

    if (confettiAnimationRef.current) {
      cancelAnimationFrame(confettiAnimationRef.current);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        
        if (p.y < canvas.height) {
          alive = true;
        }
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        
        // Draw rectangle particle
        ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        ctx.restore();
      });

      if (alive) {
        confettiAnimationRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    
    animate();
  };

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (confettiAnimationRef.current) {
        cancelAnimationFrame(confettiAnimationRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950/20 p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-500 flex flex-col justify-between overflow-hidden group">
      
      {/* Canvas for Confetti */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-50 rounded-3xl w-full h-full"
      />

      {/* Decorative Blur blob inside the game card */}
      <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-blue-500/10 blur-[40px] pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-purple-500/10 blur-[40px] pointer-events-none" />

      {/* Widget Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            Interactive Abacus
          </h3>
          <p className="text-xs text-slate-400 font-light mt-0.5">
            Slide beads to calculate and count values!
          </p>
        </div>

        {/* Audio and Mode Buttons */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border border-white/10 transition-all duration-300 ${
              soundEnabled
                ? "bg-white/10 text-emerald-400 border-emerald-500/20"
                : "bg-white/5 text-slate-400"
            } hover:scale-105 active:scale-95`}
            title={soundEnabled ? "Mute sound" : "Unmute sound"}
          >
            {soundEnabled ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L11.47 3.53a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            )}
          </button>

          {/* Mode Switch */}
          <button
            onClick={() => setMode(mode === "free" ? "challenge" : "free")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${mode === "challenge" ? "bg-amber-400 animate-pulse" : "bg-blue-400"}`} />
            {mode === "free" ? "Free Play" : "Challenge"}
          </button>
        </div>
      </div>

      {/* Main Abacus Visual Frame */}
      <div className="relative z-10 select-none px-4 flex items-center justify-center my-6">
        
        {/* Left Pillar */}
        <div className="w-5 h-72 md:h-80 rounded-l-lg bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 shadow-[inset_-2px_0_5px_rgba(0,0,0,0.5),_3px_5px_10px_rgba(0,0,0,0.4)] border-r border-amber-950 flex-shrink-0" />
        
        {/* Center Rods and Beads Workspace */}
        <div className="flex-1 h-72 md:h-80 bg-slate-950/65 relative flex flex-col justify-around py-2 border-y border-white/5 shadow-inner">
          
          {ROW_CONFIG.map((row, rIdx) => {
            const leftCount = rowStates[rIdx];
            const rightCount = 5 - leftCount;

            return (
              <div
                key={rIdx}
                className="relative w-full h-10 flex items-center justify-between group/row"
              >
                {/* Place value indicator (Visible on Hover / subtle label) */}
                <div className="absolute -top-3.5 left-2 px-1 rounded bg-slate-900/80 border border-white/5 text-[9px] text-slate-400 opacity-30 group-hover/row:opacity-100 transition-opacity pointer-events-none z-20">
                  {row.label}
                </div>

                {/* Metal rod wire */}
                <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-gradient-to-b from-slate-400 via-slate-200 to-slate-600 rounded-full shadow-[0_1px_1px_rgba(0,0,0,0.3)]" />

                {/* Beads container */}
                <div className="absolute inset-x-1 top-0 bottom-0 pointer-events-none">
                  {Array.from({ length: 5 }).map((_, bIdx) => {
                    const isOnLeft = bIdx < leftCount;
                    
                    // Dynamic styling using CSS calc for responsive left positions
                    const style = isOnLeft
                      ? { left: `calc(${bIdx} * 2.1rem)` }
                      : { left: `calc(100% - ${5 - bIdx} * 2.1rem)` };

                    return (
                      <button
                        key={bIdx}
                        onClick={() => handleBeadClick(rIdx, bIdx)}
                        style={style}
                        className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-white/15 shadow-[0_4px_6px_rgba(0,0,0,0.4),_inset_0_3px_5px_rgba(255,255,255,0.45),_inset_0_-3px_5px_rgba(0,0,0,0.55)] cursor-pointer select-none transition-all duration-500 ease-out hover:brightness-110 active:scale-95 pointer-events-auto ${row.colorClass}`}
                        title={`Slide ${row.name} bead`}
                      />
                    );
                  })}
                </div>

                {/* Right-aligned row-level mini display */}
                <div className="absolute right-2 -top-3.5 px-1 rounded bg-slate-900/80 border border-white/5 text-[9px] text-slate-400 opacity-30 group-hover/row:opacity-100 transition-opacity pointer-events-none z-20">
                  {rightCount} × {row.multiplier.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Pillar */}
        <div className="w-5 h-72 md:h-80 rounded-r-lg bg-gradient-to-r from-amber-900 via-amber-700 to-amber-800 shadow-[inset_2px_0_5px_rgba(0,0,0,0.5),_-3px_5px_10px_rgba(0,0,0,0.4)] border-l border-amber-950 flex-shrink-0" />
      </div>

      {/* Wooden Base Footer */}
      <div className="relative z-10 w-[calc(100%+1.5rem)] -ml-3 h-5 rounded bg-gradient-to-b from-amber-700 via-amber-800 to-amber-950 shadow-[0_6px_12px_rgba(0,0,0,0.45),_inset_0_1px_2px_rgba(255,255,255,0.1)] border-b border-amber-950 mb-6" />

      {/* Game Dashboard */}
      <div className="relative z-10 bg-white/[0.04] border border-white/5 rounded-2xl p-4 shadow-inner backdrop-blur-md">
        {mode === "free" ? (
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Current Count Value
              </span>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 font-mono tracking-wider mt-0.5">
                {totalValue.toLocaleString()}
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={resetAbacus}
                className="flex-1 md:flex-none px-3.5 py-2 text-xs font-bold rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 transition-all active:scale-95"
              >
                Clear
              </button>
              <button
                onClick={setAllRight}
                className="flex-1 md:flex-none px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-500/20 border border-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-all active:scale-95"
              >
                Set Max
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold block">
                  Challenge Target
                </span>
                <span className="text-3xl font-black text-amber-300 font-mono tracking-wider">
                  {targetNumber.toLocaleString()}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Your Current Code
                </span>
                <span className={`text-2xl font-black font-mono tracking-wider ${isSuccess ? "text-emerald-400" : "text-slate-300"}`}>
                  {totalValue.toLocaleString()}
                </span>
              </div>
            </div>

            {isSuccess ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 animate-bounce">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎉</span>
                  <span className="text-xs font-bold text-emerald-300">
                    Target Matched! Well done!
                  </span>
                </div>
                <button
                  onClick={generateNewChallenge}
                  className="w-full sm:w-auto px-4 py-1.5 text-xs font-extrabold rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Next Challenge
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-400">
                  Slide beads to match the target number exactly!
                </span>
                <button
                  onClick={generateNewChallenge}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-all active:scale-95 flex-shrink-0"
                >
                  Skip
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
