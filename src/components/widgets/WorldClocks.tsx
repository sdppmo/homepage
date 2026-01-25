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
    <div className="world-clocks absolute top-[15px] left-[15px] flex gap-5 z-10 md:relative md:top-0 md:left-0 md:justify-start md:p-4 md:bg-transparent md:flex-wrap md:gap-4">
      {ZONES.map((z) => {
        const state = clockStates[z.id];
        if (!state) return null;

        return (
          <div key={z.id} className="clock-container flex flex-col items-center">
            <div
              className={`clock w-24 h-24 rounded-full bg-gradient-to-br from-[#f5f5f5] to-[#d0d0d0] border-4 border-[#8b7355] relative transition-all duration-500 ease-in-out shadow-[0_0_0_2px_#c9a96e,inset_0_2px_4px_rgba(0,0,0,0.2),0_4px_8px_rgba(0,0,0,0.3)] md:w-20 md:h-20 xs:w-16 xs:h-16 xs:border-[3px] ${
                state.isNight
                  ? 'night bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] border-[#4a4a6a] shadow-[0_0_0_2px_#5a5a8a,inset_0_2px_4px_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.5),0_0_15px_rgba(100,149,237,0.3)]'
                  : ''
              }`}
            >
              <div className="clock-face w-full h-full relative rounded-full">
                <div
                  className={`hand hour-hand absolute bottom-1/2 left-1/2 origin-bottom z-[5] w-1.5 h-[22px] bg-[#222] -ml-[3px] rounded-[2px] md:h-[18px] md:w-1 xs:h-[14px] ${
                    state.isNight ? 'bg-[#e0e0e0]' : ''
                  }`}
                  style={{ transform: `rotate(${state.hourDeg}deg)` }}
                ></div>
                <div
                  className={`hand minute-hand absolute bottom-1/2 left-1/2 origin-bottom z-[5] w-1 h-7 bg-[#222] -ml-[2px] rounded-[2px] md:h-6 md:w-[3px] xs:h-5 ${
                    state.isNight ? 'bg-[#e0e0e0]' : ''
                  }`}
                  style={{ transform: `rotate(${state.minDeg}deg)` }}
                ></div>
                <div
                  className={`hand second-hand absolute bottom-1/2 left-1/2 origin-bottom z-[6] w-[2px] h-8 bg-[#e74c3c] -ml-[1px] md:h-7 md:w-[2px] xs:h-6 ${
                    state.isNight ? 'bg-[#ff6b6b]' : ''
                  }`}
                  style={{ transform: `rotate(${state.secDeg}deg)` }}
                ></div>
                <div
                  className={`clock-center absolute top-1/2 left-1/2 w-2.5 h-2.5 bg-[#e74c3c] rounded-full -translate-x-1/2 -translate-y-1/2 z-10 xs:w-2 xs:h-2 ${
                    state.isNight ? 'bg-[#ff6b6b] shadow-[0_0_5px_rgba(255,107,107,0.5)]' : ''
                  }`}
                ></div>
              </div>
            </div>
            <div className="clock-label mt-2 text-sm font-bold text-white shadow-[1px_1px_2px_#000] bg-black/60 px-3 py-1 rounded md:text-xs md:px-2 xs:text-[10px] xs:px-1.5">
              {z.label} <span className="ampm-indicator text-xs font-bold text-yellow-300 tracking-[1px] ml-1 md:text-[10px] xs:text-[9px]">{state.ampm}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WorldClocks;
