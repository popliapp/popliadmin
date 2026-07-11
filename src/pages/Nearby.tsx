import React, { useState } from 'react';
import { usePlatformStore } from '../store/usePlatformStore';
import { 
  Activity 
} from 'lucide-react';

interface CityData {
  id: string;
  name: string;
  state: string;
  creators: number;
  uploads: number;
  views: string;
  hashtag: string;
  hotspot: boolean;
  x: number; // coordinate
  y: number; // coordinate
}

const mockCitiesData: CityData[] = [
  { id: 'delhi', name: 'Delhi', state: 'NCR', creators: 38, uploads: 180, views: '1.9M', hashtag: '#sarojinishopping', hotspot: true, x: 120, y: 80 },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', creators: 45, uploads: 220, views: '2.4M', hashtag: '#cuttingchai', hotspot: true, x: 80, y: 220 },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', creators: 29, uploads: 140, views: '1.1M', hashtag: '#silkboardstruggle', hotspot: false, x: 130, y: 310 },
  { id: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', creators: 22, uploads: 98, views: '840K', hashtag: '#tundaykababi', hotspot: false, x: 180, y: 110 },
  { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', creators: 18, uploads: 85, views: '650K', hashtag: '#pyazkachori', hotspot: false, x: 90, y: 120 },
  { id: 'indore', name: 'Indore', state: 'Madhya Pradesh', creators: 15, uploads: 72, views: '490K', hashtag: '#indoremetro', hotspot: false, x: 110, y: 170 },
  { id: 'madurai', name: 'Madurai', state: 'Tamil Nadu', creators: 12, uploads: 54, views: '320K', hashtag: '#jasminemarket', hotspot: false, x: 140, y: 350 }
];

export const NearbyPage: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<CityData>(mockCitiesData[0]);
  const { creators } = usePlatformStore();

  // Find local creators in the selected city from our Zustand store
  const localCreators = creators
    .filter(c => c.city.toLowerCase() === selectedCity.name.toLowerCase())
    .slice(0, 4);

  return (
    <div className="space-y-6 font-mono relative text-[10px] text-slate-600 uppercase select-none font-bold">
      {/* 🚀 Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#BAE6FD] pb-4 gap-4">
        <div>
          <h1 className="text-xl font-extrabold uppercase tracking-wider text-[#0C4A6E]">Nearby Location Intelligence</h1>
          <p className="text-slate-500 text-[10px] uppercase mt-1">POPLI hyperlocal creator heatmaps and city-specific viral nodes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive India Map visual panel */}
        <div className="bg-[#FFFFFF] border border-[#BAE6FD] p-5 rounded-[2px] lg:col-span-2 space-y-4 flex flex-col h-[480px]">
          <span className="text-xs font-extrabold uppercase tracking-widest block text-[#0C4A6E] select-none">INDIA CREATOR CLUSTERS MAP</span>
          
          <div className="flex-1 bg-[#F0F9FF]/40 border border-[#BAE6FD] rounded-[1px] relative overflow-hidden flex items-center justify-center min-h-[300px]">
            {/* Styled Grid lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1B1D21_1px,transparent_1px),linear-gradient(to_bottom,#1B1D21_1px,transparent_1px)] bg-[size:16px_16px] opacity-20" />
            
            {/* SVG Map representation */}
            <svg className="w-full h-full max-w-[340px] max-h-[380px] z-10" viewBox="0 0 300 400">
              {/* Simulated India Map outline coordinates */}
              <path 
                d="M 120 40 L 150 60 L 170 90 L 220 100 L 250 140 L 210 170 L 230 200 L 180 230 L 160 300 L 140 370 L 120 380 L 130 310 L 80 240 L 60 210 L 50 160 L 80 120 Z" 
                fill="#0C0D0E" 
                stroke="#252830" 
                strokeWidth="1.5" 
                strokeDasharray="4 4"
              />
              
              {/* Clickable India City Nodes */}
              {mockCitiesData.map((city) => {
                const isActive = selectedCity.id === city.id;
                return (
                  <g 
                    key={city.id} 
                    transform={`translate(${city.x}, ${city.y})`}
                    className="cursor-pointer"
                    onClick={() => setSelectedCity(city)}
                  >
                    {/* Ring aura */}
                    <circle 
                      cx="0" 
                      cy="0" 
                      r={isActive ? "10" : "6"} 
                      fill="none" 
                      stroke={isActive ? "#0ea5e9" : (city.hotspot ? "#FF2A00" : "#00D8F6")} 
                      strokeWidth="1.5"
                      className="animate-pulse"
                    />
                    {/* Inner Solid dot */}
                    <circle 
                      cx="0" 
                      cy="0" 
                      r="4" 
                      fill={isActive ? "#0ea5e9" : (city.hotspot ? "#FF2A00" : "#00D8F6")}
                    />
                    {/* City text */}
                    <text 
                      x="10" 
                      y="4" 
                      fill={isActive ? "#0ea5e9" : "#5F6E80"} 
                      fontSize="7" 
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {city.name}
                    </text>
                  </g>
                );
              })}
            </svg>
            
            {/* Map Legend */}
            <div className="absolute bottom-3 left-3 bg-[#E0F2FE]/75 px-3 py-2 text-[7px] border border-[#BAE6FD] rounded-[1px] space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9]" />
                <span>ACTIVE SELECTION</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF2A00]" />
                <span>HOTSPOT (HIGH DENSITY)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D8F6]" />
                <span>STABLE GROWING LOOP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected City location metrics card */}
        <div className="bg-[#FFFFFF] border border-[#BAE6FD] p-5 rounded-[2px] flex flex-col justify-between h-[480px]">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-[#BAE6FD] pb-3 select-none">
              <div>
                <span className="text-[#0C4A6E] text-xs font-black tracking-tight leading-none block">
                  {selectedCity.name} METRICS
                </span>
                <span className="text-slate-500 text-[8px] font-normal block mt-1 uppercase">STATE: {selectedCity.state}</span>
              </div>
              {selectedCity.hotspot && (
                <span className="bg-red-50 border border-red-200 text-red-600 text-[7px] font-black px-1.5 py-0.5 rounded-[1px] tracking-wider uppercase animate-pulse">
                  HOTSPOT
                </span>
              )}
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-[#F0F9FF] border border-[#BAE6FD] rounded-[2px]">
                <span className="text-slate-500 block leading-none">CREATORS:</span>
                <span className="text-[#0C4A6E] text-xs font-black mt-1.5 block tracking-tight">{selectedCity.creators} ACTIVE</span>
              </div>
              <div className="p-3 bg-[#F0F9FF] border border-[#BAE6FD] rounded-[2px]">
                <span className="text-slate-500 block leading-none">VIEWS LOOP:</span>
                <span className="text-[#0ea5e9] text-xs font-black mt-1.5 block tracking-tight">{selectedCity.views} VIEWS</span>
              </div>
              <div className="p-3 bg-[#F0F9FF] border border-[#BAE6FD] rounded-[2px] col-span-2">
                <span className="text-slate-500 block leading-none">LOCAL VIRAL HASHTAG:</span>
                <span className="text-[#65A30D] text-xs font-black mt-1.5 block tracking-tight">{selectedCity.hashtag}</span>
              </div>
            </div>

            {/* Local creators listing preview */}
            <div className="space-y-2">
              <span className="text-slate-500 block">TOP INFLUENCERS IN {selectedCity.name}:</span>
              {localCreators.length > 0 ? (
                localCreators.map((creator) => (
                  <div key={creator.id} className="p-2 bg-[#F0F9FF] border border-[#BAE6FD] rounded-[1px] flex justify-between items-center text-[9px]">
                    <div className="flex items-center gap-2">
                      <img 
                        src={creator.avatar} 
                        alt={creator.name} 
                        className="w-6 h-6 rounded-full border border-gray-700 object-cover shrink-0" 
                      />
                      <span className="text-[#0C4A6E] font-extrabold truncate max-w-[80px]">@{creator.username}</span>
                    </div>
                    <span className="text-slate-500 font-mono font-semibold">{creator.followers.toLocaleString()} FOLL</span>
                  </div>
                ))
              ) : (
                <span className="text-slate-400 block text-center py-2">No creators found</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-50/20 border border-emerald-100 text-emerald-700 font-bold uppercase px-3 py-1.5 rounded-[1px] mt-4 font-mono select-none">
            <Activity className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
            <span>GEO INTEL SYNCED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
