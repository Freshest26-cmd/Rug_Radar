import React from 'react';

export const TokenCardSkeleton = () => {
  return (
    <div className="bg-[#0a0f16] border border-slate-900 p-6 rounded-xl relative animate-pulse">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-slate-800 rounded w-1/3"></div>
          <div className="h-3 bg-slate-800 rounded w-1/2"></div>
        </div>
        <div className="h-5 bg-slate-800 rounded w-16 ml-4"></div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-950/50 p-3 rounded-lg border border-slate-900/50 space-y-2">
            <div className="h-2 bg-slate-800 rounded w-1/2"></div>
            <div className="h-4 bg-slate-800 rounded w-3/4"></div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="h-2 bg-slate-800 rounded w-1/4"></div>
          <div className="h-2 bg-slate-800 rounded w-16"></div>
        </div>
        <div className="h-1.5 bg-slate-900 rounded-full w-full"></div>
      </div>
    </div>
  );
};

export const RecommendationSkeleton = () => {
  return (
    <div className="bg-[#0a0f16] border border-slate-900 p-4 md:p-6 rounded-xl grid grid-cols-1 md:grid-cols-12 items-center gap-4 md:gap-6 animate-pulse">
      <div className="md:col-span-1">
        <div className="h-8 bg-slate-800 rounded w-8"></div>
      </div>
      
      <div className="md:col-span-4 space-y-2">
        <div className="h-5 bg-slate-800 rounded w-2/3"></div>
        <div className="h-3 bg-slate-800 rounded w-1/2"></div>
      </div>

      <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-2 bg-slate-800 rounded w-1/2"></div>
            <div className="h-4 bg-slate-800 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
