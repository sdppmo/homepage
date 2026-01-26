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

        const hourDeg = (h % 12) * 30 + m * 0.5;
        const minDeg = m * 6 + s * 0.1;
        const secDeg = s * 6 + ms * 0.006;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const isNight = h >= 18 || h < 6;

        newStates[z.id] = { hourDeg, minDeg, secDeg, ampm, isNight };
      });

      setClockStates(newStates);
    };

    const timeout = setTimeout(() => {
      tick();
      const interval = setInterval(tick, 50);
      return () => clearInterval(interval);
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="w-full p-2 md:p-4">
      <div className="grid grid-cols-2 gap-3 md:flex md:flex-row md:gap-4 md:justify-start">
        {ZONES.map((z) => {
          const state = clockStates[z.id];
          if (!state) return null;

          return (
            <div key={z.id} className="flex flex-col items-center">
              <div
                className={`w-16 h-16 md:w-20 md:h-20 rounded-full relative transition-all duration-500 ease-in-out ${
                  state.isNight
                    ? 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-2 border-slate-600 shadow-[0_0_15px_rgba(59,130,246,0.2),inset_0_2px_4px_rgba(0,0,0,0.4)]'
                    : 'bg-gradient-to-br from-slate-100 to-slate-300 border-2 border-slate-400 shadow-[0_4px_8px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.5)]'
                }`}
              >
                <div className="w-full h-full relative rounded-full">
                  <div
                    className={`absolute bottom-1/2 left-1/2 origin-bottom z-[5] w-1 md:w-1.5 h-[14px] md:h-[18px] -ml-[2px] md:-ml-[3px] rounded-[2px] ${
                      state.isNight ? 'bg-slate-300' : 'bg-slate-700'
                    }`}
                    style={{ transform: `rotate(${state.hourDeg}deg)` }}
                  ></div>
                  <div
                    className={`absolute bottom-1/2 left-1/2 origin-bottom z-[5] w-[3px] md:w-1 h-5 md:h-6 -ml-[1.5px] md:-ml-[2px] rounded-[2px] ${
                      state.isNight ? 'bg-slate-300' : 'bg-slate-700'
                    }`}
                    style={{ transform: `rotate(${state.minDeg}deg)` }}
                  ></div>
                  <div
                    className={`absolute bottom-1/2 left-1/2 origin-bottom z-[6] w-[1px] md:w-[2px] h-6 md:h-7 -ml-[0.5px] md:-ml-[1px] ${
                      state.isNight ? 'bg-blue-400' : 'bg-blue-500'
                    }`}
                    style={{ transform: `rotate(${state.secDeg}deg)` }}
                  ></div>
                  <div
                    className={`absolute top-1/2 left-1/2 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2 z-10 ${
                      state.isNight ? 'bg-blue-400 shadow-[0_0_5px_rgba(59,130,246,0.5)]' : 'bg-blue-500'
                    }`}
                  ></div>
                </div>
              </div>
              <div className="mt-1.5 text-[10px] md:text-xs font-medium text-slate-300 bg-slate-800/80 backdrop-blur-sm px-2 py-0.5 rounded border border-slate-700/50">
                {z.label} <span className="text-[9px] md:text-[10px] font-semibold text-blue-400 ml-0.5">{state.ampm}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorldClocks;
