'use client';

import { useEffect, useState, useMemo } from 'react';

interface ClockState {
  hourDeg: number;
  minDeg: number;
  secDeg: number;
  ampm: string;
  isNight: boolean;
}

const ZONES = [
  { id: 'indonesia', offset: 7, label: 'Indonesia' },
  { id: 'seoul', offset: 9, label: 'Seoul' },
  { id: 'newyork', offset: -5, label: 'New York' },
  { id: 'sanfrancisco', offset: -8, label: 'San Francisco' },
];

// Calculate initial state for SSR - shows correct time immediately
const getInitialStates = (): Record<string, ClockState> => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const states: Record<string, ClockState> = {};
  
  ZONES.forEach((z) => {
    const local = new Date(utc + z.offset * 3600000);
    const h = local.getHours();
    const m = local.getMinutes();
    const s = local.getSeconds();
    
    states[z.id] = {
      hourDeg: (h % 12) * 30 + m * 0.5,
      minDeg: m * 6 + s * 0.1,
      secDeg: s * 6,
      ampm: h >= 12 ? 'PM' : 'AM',
      isNight: h >= 18 || h < 6,
    };
  });
  
  return states;
};

const WorldClocks = () => {
  // Initialize with current time so clocks show immediately
  const initialStates = useMemo(() => getInitialStates(), []);
  const [clockStates, setClockStates] = useState<Record<string, ClockState>>(initialStates);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const ms = now.getMilliseconds();

      const newStates: Record<string, ClockState> = {};

      ZONES.forEach((z) => {
        const local = new Date(utc + z.offset * 3600000);
        const h = local.getHours();
        const m = local.getMinutes();
        const s = local.getSeconds();

        // Smooth rotation: include sub-second for second hand
        const hourDeg = (h % 12) * 30 + m * 0.5;
        const minDeg = m * 6 + s * 0.1;
        const secDeg = s * 6 + ms * 0.006;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const isNight = h >= 18 || h < 6;

        newStates[z.id] = { hourDeg, minDeg, secDeg, ampm, isNight };
      });

      setClockStates(newStates);
    };

    // Start animation after a short delay to prioritize initial render
    const timeout = setTimeout(() => {
      tick();
      const interval = setInterval(tick, 50);
      return () => clearInterval(interval);
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="world-clocks w-full p-2 md:p-4">
      {/* Mobile: 2x2 grid, Desktop: 1x4 row left-aligned */}
      <div className="grid grid-cols-2 gap-3 md:flex md:flex-row md:gap-4 md:justify-start">
        {ZONES.map((z) => {
          const state = clockStates[z.id];
          if (!state) return null;

          return (
            <div key={z.id} className="clock-container flex flex-col items-center">
              <div
                className={`clock w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#f5f5f5] to-[#d0d0d0] border-[3px] md:border-4 border-[#8b7355] relative transition-all duration-500 ease-in-out shadow-[0_0_0_2px_#c9a96e,inset_0_2px_4px_rgba(0,0,0,0.2),0_4px_8px_rgba(0,0,0,0.3)] ${
                  state.isNight
                    ? 'night bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] border-[#4a4a6a] shadow-[0_0_0_2px_#5a5a8a,inset_0_2px_4px_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.5),0_0_15px_rgba(100,149,237,0.3)]'
                    : ''
                }`}
              >
                <div className="clock-face w-full h-full relative rounded-full">
                  <div
                    className={`hand hour-hand absolute bottom-1/2 left-1/2 origin-bottom z-[5] w-1 md:w-1.5 h-[14px] md:h-[18px] bg-[#222] -ml-[2px] md:-ml-[3px] rounded-[2px] ${
                      state.isNight ? 'bg-[#e0e0e0]' : ''
                    }`}
                    style={{ transform: `rotate(${state.hourDeg}deg)` }}
                  ></div>
                  <div
                    className={`hand minute-hand absolute bottom-1/2 left-1/2 origin-bottom z-[5] w-[3px] md:w-1 h-5 md:h-6 bg-[#222] -ml-[1.5px] md:-ml-[2px] rounded-[2px] ${
                      state.isNight ? 'bg-[#e0e0e0]' : ''
                    }`}
                    style={{ transform: `rotate(${state.minDeg}deg)` }}
                  ></div>
                  <div
                    className={`hand second-hand absolute bottom-1/2 left-1/2 origin-bottom z-[6] w-[1px] md:w-[2px] h-6 md:h-7 bg-[#e74c3c] -ml-[0.5px] md:-ml-[1px] ${
                      state.isNight ? 'bg-[#ff6b6b]' : ''
                    }`}
                    style={{ transform: `rotate(${state.secDeg}deg)` }}
                  ></div>
                  <div
                    className={`clock-center absolute top-1/2 left-1/2 w-2 h-2 md:w-2.5 md:h-2.5 bg-[#e74c3c] rounded-full -translate-x-1/2 -translate-y-1/2 z-10 ${
                      state.isNight ? 'bg-[#ff6b6b] shadow-[0_0_5px_rgba(255,107,107,0.5)]' : ''
                    }`}
                  ></div>
                </div>
              </div>
              <div className="clock-label mt-1.5 text-[10px] md:text-xs font-bold text-white shadow-[1px_1px_2px_#000] bg-black/60 px-2 py-0.5 rounded">
                {z.label} <span className="ampm-indicator text-[9px] md:text-[10px] font-bold text-yellow-300 tracking-[1px] ml-0.5">{state.ampm}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorldClocks;
