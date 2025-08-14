import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DecayChart from "@/components/DecayChart";
import { COFFEES, CoffeeCategory, CoffeeItem, byCategory, HALF_LIFE_HOURS } from "@/data/coffees";
import { TimeOfDay, getTimeOfDay, defaultEnergyForTime } from "@/hooks/useTimeOfDay";
import { EnergyLevel, bestPicksForTime } from "@/lib/recommendation";
import { getMilestones, caffeineRemaining } from "@/lib/caffeine";
import { Input } from "@/components/ui/input";
import BedtimeControl from "@/components/BedtimeControl";
import { getSleepVerdict } from "@/lib/sleepVerdict";
import ServingControl from "@/components/ServingControl";
import { adjustedMg, SizeOz } from "@/lib/serving";

const categoryLabels: Record<CoffeeCategory, string> = {
  espresso: "☕ Espresso",
  milk: "🥛 Milk Based", 
  water: "💧 Water Brewed",
  tea: "🍃 Tea",
  cold: "🧊 Cold",
  specialty: "✨ Specialty",
  energy: "⚡ Energy Drinks",
  soda: "🥤 Sodas",
};

// hoursUntil: compute hours from now until a given HH:mm bedtime (today or tomorrow)
const hoursUntil = (timeStr: string, now: Date = new Date()): number => {
  const [hh, mm] = timeStr.split(":").map(Number);
  const bed = new Date(now);
  bed.setHours(hh ?? 23, mm ?? 0, 0, 0);
  if (bed.getTime() <= now.getTime()) {
    bed.setDate(bed.getDate() + 1);
  }
  const ms = bed.getTime() - now.getTime();
  return Math.max(0, ms / 36e5);
};

// Map time-of-day to anchor HH:mm used as "virtual now"
const anchorForTime: Record<TimeOfDay, string> = {
  morning: "09:00",
  afternoon: "15:00",
  evening: "19:00",
  late_night: "22:00",
};

// Compute hours from an anchor HH:mm to a bedtime HH:mm within 24h window
const hoursBetween = (bedHHMM: string, anchorHHMM: string): number => {
  const [bh, bm] = bedHHMM.split(":").map(Number);
  const [ah, am] = anchorHHMM.split(":").map(Number);
  const bedMin = (bh ?? 23) * 60 + (bm ?? 0);
  const anchorMin = (ah ?? 0) * 60 + (am ?? 0);
  let diff = bedMin - anchorMin;
  if (diff < 0) diff += 24 * 60; // wrap to next day
  return diff / 60;
};

const Ask = () => {
  const [time, setTime] = useState<TimeOfDay>(getTimeOfDay());
  const [energy, setEnergy] = useState<EnergyLevel>(defaultEnergyForTime[time]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selected, setSelected] = useState<CoffeeItem | null>(null);
  const [bedtime, setBedtime] = useState<string>("23:00");
  const [query, setQuery] = useState<string>("");
  const [sizeOz, setSizeOz] = useState<SizeOz>(12);
  const [shots, setShots] = useState<1 | 2>(1);
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const virtualHoursUntilBed = useMemo(() => hoursBetween(bedtime, anchorForTime[time]), [bedtime, time]);
  const best = useMemo(() => bestPicksForTime(time, energy, virtualHoursUntilBed, HALF_LIFE_HOURS, sizeOz, shots), [time, energy, virtualHoursUntilBed, sizeOz, shots, refreshCount]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as CoffeeItem[];
    return COFFEES.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      (c.tags?.some((t) => t.includes(q)) ?? false)
    );
  }, [query]);
  
  useEffect(() => {
    document.title = "Ask CoffeePolice – Smart coffee picks";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Browse coffees, see half-life charts, and get time-smart picks.");
  }, []);

  const renderCard = (c: CoffeeItem) => {
    const mgAdj = adjustedMg(c, sizeOz, shots);
    const v = getSleepVerdict(mgAdj, virtualHoursUntilBed, HALF_LIFE_HOURS);
    return (
      <Card key={c.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm" onClick={() => setSelected(c)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-amber-700 transition-colors">{c.name}</div>
              <div className="text-sm text-gray-600 leading-relaxed">{c.description}</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-medium border-amber-200 text-amber-700 bg-amber-50/50">
              {v.chip}
            </Badge>
            <span className="text-xs text-gray-500 font-medium">{mgAdj}mg caffeine</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getRecommendationContext = (index: number, coffee: CoffeeItem, verdict: any) => {
    // Get coffee-specific icon based on category and name
    const getCoffeeIcon = (coffee: CoffeeItem) => {
      const name = coffee.name.toLowerCase();
      const category = coffee.category;
      
      // Check for high caffeine drinks first (use special icon)
      if (name.includes('espresso') || name.includes('cold brew') || name.includes('red eye') || name.includes('black eye') || name.includes('dead eye')) {
        return 'strong-coffee'; // Special identifier for high caffeine drinks
      }
      
      // Check for specific coffee types
      if (name.includes('latte')) return '🥛';
      if (name.includes('cappuccino')) return '☕';
      if (name.includes('americano')) return '☕';
      if (name.includes('mocha')) return '🍫';
      if (name.includes('flat white')) return '🥛';
      if (name.includes('iced')) return '🧊';
      if (name.includes('decaf')) return '🫖';
      if (name.includes('tea')) return '🫖';
      if (name.includes('herbal')) return '🌿';
      if (name.includes('chai')) return '🫖';
      if (name.includes('pour over')) return '💧';
      if (name.includes('french press')) return '☕';
      if (name.includes('aeropress')) return '☕';
      if (name.includes('siphon')) return '🧪';
      if (name.includes('chemex')) return '💧';
      if (name.includes('drip')) return '☕';
      if (name.includes('filter')) return '☕';
      
      // Fallback to category-based icons
      switch (category) {
        case 'espresso': return 'strong-coffee'; // High caffeine category
        case 'milk': return '🥛';
        case 'water': return '💧';
        case 'tea': return '🫖';
        case 'cold': return '🧊';
        case 'specialty': return '✨';
        default: return '☕';
      }
    };

    const contexts = [
      {
        title: "Perfect timing",
        description: `This ${coffee.name.toLowerCase()} will give you the right energy boost for your ${time} activities while ensuring you're ready for bed at ${bedtime}.`,
        icon: getCoffeeIcon(coffee)
      },
      {
        title: "Smart choice",
        description: `With ${verdict.remainingAtBedtime || "minimal"} caffeine remaining at bedtime, this ${coffee.name.toLowerCase()} strikes the perfect balance for your energy needs.`,
        icon: getCoffeeIcon(coffee)
      },
      {
        title: "Sleep-friendly",
        description: `This ${coffee.name.toLowerCase()} provides gentle energy that naturally fades, helping you maintain your sleep schedule without disruption.`,
        icon: getCoffeeIcon(coffee)
      }
    ];
    return contexts[index % contexts.length];
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50/30">
      <section className="px-6 py-8 max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="relative">
              <img
                src="/lovable-uploads/31c42cd4-bee4-40d8-ba66-0438b1c8dc85.png"
                alt="CoffeePolice mascot logo"
                className="h-12 w-12 rounded-xl shadow-lg"
                loading="lazy"
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl blur opacity-20"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Ask CoffeePolice</h1>
              <p className="text-gray-600">Time‑aware picks with caffeine half‑life guidance</p>
            </div>
          </div>
         </header>

                                   {/* Preferences Section - Always Visible */}
          <section className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-100/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Default Preferences</h2>
                  <p className="text-sm text-gray-600">These settings determine your coffee recommendations</p>
                </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowPreferences(!showPreferences)}
                  className="text-amber-700 hover:text-amber-800 hover:bg-amber-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {showPreferences ? "Hide" : "Customize"}
            </Button>
          </div>
              
              {/* Current Settings Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <span className="text-amber-600 text-sm">⏰</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Bed time</p>
                    <p className="text-sm font-semibold text-gray-900">{bedtime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-sm">⚡</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Energy level</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{energy}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50/50 rounded-xl border border-green-100">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-sm">🛡️</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Safe limit</p>
                    <p className="text-sm font-semibold text-gray-900">≤50mg for good sleep</p>
                  </div>
                </div>
              </div>
              
              {/* Expandable Preferences */}
        {showPreferences && (
                <div className="border-t border-amber-100 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Time of day</label>
                  <Select value={time} onValueChange={(v: TimeOfDay) => { setTime(v); setEnergy(defaultEnergyForTime[v]); }}>
                    <SelectTrigger className="w-full bg-white/80 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">🌅 Morning</SelectItem>
                      <SelectItem value="afternoon">☀️ Afternoon</SelectItem>
                      <SelectItem value="evening">🌆 Evening</SelectItem>
                      <SelectItem value="late_night">🌙 Late night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Energy level</label>
                  <Select value={energy} onValueChange={(v: EnergyLevel) => setEnergy(v)}>
                    <SelectTrigger className="w-full bg-white/80 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20">
                      <SelectValue placeholder="Select energy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">⚡ High</SelectItem>
                      <SelectItem value="medium">⚡ Medium</SelectItem>
                      <SelectItem value="low">⚡ Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <BedtimeControl value={bedtime} onChange={setBedtime} />
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Serving</label>
                  <ServingControl sizeOz={sizeOz} onSizeChange={setSizeOz} shots={shots} onShotsChange={setShots} />
                </div>
              </div>
                </div>
              )}
            </div>
          </section>

                                   {/* Coffee Recommendations & Browse Section */}
          <article className="mb-16">
            {/* Section Header */}
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-100/30 via-transparent to-orange-100/30 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-amber-100/50 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg font-bold">☕</span>
                      </div>
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                          Top Picks for You
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                          Based on preferences • Time of the day • Caffeine amount
                        </p>
                      </div>
                    </div>
                  </div>
                  
                                     <Button
                     variant="outline"
                     size="lg"
                     onClick={() => {
                       setIsRefreshing(true);
                       setRefreshCount(prev => prev + 1);
                       setTimeout(() => setIsRefreshing(false), 500);
                     }}
                     disabled={isRefreshing}
                     className="border-2 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-all duration-300 disabled:opacity-50 shadow-sm hover:shadow-md"
                   >
                     <svg 
                       className={`w-5 h-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} 
                       fill="none" 
                       stroke="currentColor" 
                       viewBox="0 0 24 24"
                     >
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                     </svg>
                     {isRefreshing ? 'Refreshing...' : 'Get new picks'}
                   </Button>
          </div>
          
                 {/* Best Picks Section */}
                 <div className="mb-8">
                   {/* <h3 className="text-lg font-semibold text-gray-900 mb-4">Best picks for you</h3> */}
                   
                   {/* Sleep Warning Section */}
          {(() => {
            const warn = time === "late_night" && energy === "high" && virtualHoursUntilBed < 3;
            if (!warn) return null;
            const decaf = COFFEES.find((c) => c.id === "decaf_coffee");
            const herbal = COFFEES.find((c) => c.id === "herbal_tea");
            const coldBrew = COFFEES.find((c) => c.id === "cold_brew");
            const remainingCold = coldBrew ? Math.round(caffeineRemaining(adjustedMg(coldBrew, sizeOz, shots), virtualHoursUntilBed, HALF_LIFE_HOURS)) : undefined;
            return (
               <div className="mb-12 relative">
                 <div className="absolute inset-0 bg-gradient-to-r from-red-100/20 via-orange-100/20 to-red-100/20 rounded-3xl blur-2xl"></div>
                 <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 border-2 border-red-200/50 shadow-xl">
                   <div className="flex items-start gap-4 mb-6">
                     <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                       <span className="text-red-600 text-xl">⚠️</span>
                  </div>
                     <div className="flex-1">
                       <h3 className="font-bold text-gray-900 text-xl mb-2">Sleep Alert</h3>
                       <p className="text-gray-600 leading-relaxed">
                         Your {bedtime} bedtime is approaching. High-caffeine drinks now could significantly impact your sleep quality.
                       </p>
                  </div>
                </div>
                   
                   <div className="grid sm:grid-cols-3 grid-cols-1 gap-6">
                  {decaf && (
                       <div className="group p-4 rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all duration-300">
                         <div className="flex items-center gap-3 mb-3">
                           <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                             <span className="text-green-600 text-sm">✅</span>
                           </div>
                           <h4 className="font-semibold text-green-800">Safe choice</h4>
                         </div>
                         <p className="text-sm text-green-700 leading-relaxed">
                           {decaf.name} - Virtually no impact on sleep, perfect for late-night cravings.
                         </p>
                       </div>
                  )}
                  {herbal && (
                       <div className="group p-4 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-300">
                         <div className="flex items-center gap-3 mb-3">
                           <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                             <span className="text-blue-600 text-sm">🫖</span>
                           </div>
                           <h4 className="font-semibold text-blue-800">Zero caffeine</h4>
                         </div>
                         <p className="text-sm text-blue-700 leading-relaxed">
                           {herbal.name} - A calming drink to help you wind down naturally.
                         </p>
                       </div>
                  )}
                  {coldBrew && (
                       <div className="group p-4 rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50 hover:shadow-lg transition-all duration-300">
                         <div className="flex items-center gap-3 mb-3">
                           <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                             <span className="text-red-600 text-sm">🚫</span>
                           </div>
                           <h4 className="font-semibold text-red-800">High risk</h4>
                         </div>
                         <p className="text-sm text-red-700 leading-relaxed">
                           Cold Brew - {remainingCold !== undefined ? `~${remainingCold}mg` : "A lot"} would remain in your system at bedtime.
                         </p>
                       </div>
                     )}
                   </div>
                </div>
              </div>
            );
          })()}
          
                     {/* Recommendation Cards */}
           <div className="grid sm:grid-cols-3 grid-cols-1 gap-8">
            {best.map((c, index) => {
              const mgAdj = adjustedMg(c, sizeOz, shots);
              const v = getSleepVerdict(mgAdj, virtualHoursUntilBed, HALF_LIFE_HOURS);
              const context = getRecommendationContext(index, c, v);
              return (
                 <Card 
                   key={c.id} 
                   className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-gradient-to-br from-white via-amber-50/20 to-white backdrop-blur-sm" 
                   onClick={() => setSelected(c)}
                 >
                   {/* Background gradient overlay */}
                   <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-orange-400/5 to-amber-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                   
                   {/* Card Header */}
                   <CardHeader className="relative pb-6">
                     <div className="flex items-start justify-between mb-4">
                       <div className="flex-1">
                         <div className="flex items-center gap-3 mb-3">
                           <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                             {context.icon === 'strong-coffee' ? (
                               <img 
                                 src="/icons/strong-coffee.svg" 
                                 alt="Strong coffee" 
                                 className="w-8 h-8"
                               />
                             ) : (
                      <span className="text-2xl">{context.icon}</span>
                             )}
                           </div>
                           <div className="flex-1">
                             <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-amber-800 transition-colors leading-tight">
                               {c.name}
                             </CardTitle>
                             <div className="flex items-center gap-2 mt-1">
                               {/* <Badge 
                                 variant="outline" 
                                 className="text-xs font-semibold border-amber-200 text-amber-700 bg-amber-50/70 px-2 py-1"
                               >
                                 {v.chip}
                               </Badge> */}
                               <span className="text-xs text-gray-500 font-medium">
                                 {mgAdj}mg caffeine
                               </span>
                             </div>
                           </div>
                         </div>
                         <p className="text-sm text-gray-600 leading-relaxed">
                           {c.description} {context.description}
                         </p>
                       </div>
                    </div>
                  </CardHeader>
                   
                   {/* Card Content */}
                   <CardContent className="relative pt-0">
                     <div className="space-y-4">
                       {/* Quick Info */}
                       <div className="flex items-center justify-between text-xs text-gray-500">
                         <span className="flex items-center gap-1">
                           <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                           Sleep-friendly
                         </span>
                         <span className="flex items-center gap-1">
                           <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                           Perfect timing
                         </span>
                      </div>
                    </div>
                  </CardContent>
                   
                   {/* Hover effect indicator */}
                   <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </Card>
              );
            })}
          </div>
                 
                  {/* Browse & Search Section */}
                  <div className="border-t border-amber-100 pt-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Explore More</h3>
                      <span className="text-xs text-gray-500 bg-amber-50 px-2 py-1 rounded-full">
                        {COFFEES.length} options
                      </span>
                    </div>

                    {/* Compact Search */}
                    <div className="relative mb-6">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search drinks..."
                        className="pl-10 bg-white/80 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 h-10"
                      />
                      {query && (
                        <button
                          onClick={() => setQuery("")}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {query ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-gray-700">
                            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{query}"
                          </h4>
                        </div>
                        {filtered.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.slice(0, 6).map(renderCard)}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="text-4xl mb-2">☕</div>
                            <p className="text-gray-500 text-sm">No matches found</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Compact Category Pills */}
                        <div className="mb-6">
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            <button
                              onClick={() => setActiveTab("all")}
                              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                activeTab === "all"
                                  ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              All
                            </button>
                            {(Object.keys(categoryLabels) as CoffeeCategory[]).slice(0, 4).map((cat) => (
                              <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                  activeTab === cat
                                    ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                {categoryLabels[cat]}
                              </button>
                            ))}
                            {Object.keys(categoryLabels).length > 4 && (
                              <Select value={activeTab} onValueChange={setActiveTab}>
                                <SelectTrigger className="flex-shrink-0 w-20 h-8 text-xs bg-gray-100 border-0">
                                  <SelectValue placeholder="More..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {(Object.keys(categoryLabels) as CoffeeCategory[]).slice(4).map((cat) => (
                                    <SelectItem key={cat} value={cat} className="text-sm">
                                      {categoryLabels[cat]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>

                        {/* Compact Grid - Show only 6 items max */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {(activeTab === "all" ? COFFEES : byCategory(activeTab as CoffeeCategory))
                            .slice(0, 6)
                            .map(renderCard)}
                        </div>

                        {(activeTab === "all" ? COFFEES : byCategory(activeTab as CoffeeCategory)).length > 6 && (
                          <div className="text-center mt-6">
                            <button 
                              onClick={() => setQuery("show-all-" + activeTab)}
                              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                            >
                              View all {(activeTab === "all" ? COFFEES : byCategory(activeTab as CoffeeCategory)).length} options →
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
               </div>
             </div>
          </div>
        </article>

        <div className="text-center">
          <Link to="/">
            <Button variant="outline" className="px-8 py-3 text-lg font-medium border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-colors">
              ← Back to Home
            </Button>
          </Link>
        </div>

        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-amber-50/30 to-white backdrop-blur-sm border-amber-200 shadow-2xl">
            {selected && (
              <>
                {/* Header Section */}
                <DialogHeader className="pb-4 border-b border-amber-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xl">☕</span>
                    </div>
                    <div className="flex-1">
                      <DialogTitle className="text-2xl font-bold text-gray-900 mb-1">{selected.name}</DialogTitle>
                      <p className="text-gray-600 text-sm">{selected.description}</p>
                    </div>
                  </div>
                </DialogHeader>

                {(() => {
                  const mgAdj = adjustedMg(selected, sizeOz, shots);
                  const v = getSleepVerdict(mgAdj, virtualHoursUntilBed, HALF_LIFE_HOURS);
                  const milestones = getMilestones(mgAdj, HALF_LIFE_HOURS);
                  const remainingAtBedtime = caffeineRemaining(mgAdj, virtualHoursUntilBed, HALF_LIFE_HOURS);
                  
                  return (
                    <div className="space-y-6">
                      {/* Sleep Verdict - Compact */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50/50">
                              {v.chip}
                            </Badge>
                            <span className="text-sm font-medium text-gray-900">{v.headline}</span>
                          </div>
                          <span className="text-xs text-gray-600 font-mono bg-white/60 px-2 py-1 rounded">
                            {remainingAtBedtime}mg at bedtime
                          </span>
                        </div>
                      </div>

                      {/* Hero: Caffeine Decay Chart */}
                      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                              <span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs">📈</span>
                              </span>
                              Caffeine Decay Timeline
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              How your body processes <span className="font-medium text-amber-700">{mgAdj}mg</span> of caffeine over time
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Half-life</div>
                            <div className="text-sm font-semibold text-blue-600">{HALF_LIFE_HOURS}h</div>
                          </div>
                        </div>

                        {/* Enhanced Chart */}
                        <div className="h-56 mb-4 bg-gradient-to-b from-blue-50/30 to-transparent rounded-xl p-4">
                          <DecayChart mg={mgAdj} halfLife={HALF_LIFE_HOURS} />
                        </div>

                        {/* Scientific Insights Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Milestones */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <span className="w-4 h-4 bg-orange-100 rounded flex items-center justify-center">
                                <span className="text-orange-600 text-xs">⏱️</span>
                              </span>
                              Key Milestones
                            </h4>
                            {milestones.map((m) => (
                              <div key={m.label} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-medium text-gray-600">{m.label}</span>
                                  <span className="text-xs text-gray-500">{m.hours}h</span>
                                </div>
                                <div className="text-sm font-semibold text-orange-600">{m.remaining}mg remaining</div>
                              </div>
                            ))}
                          </div>

                          {/* Science Facts */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <span className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                                <span className="text-blue-600 text-xs">🧬</span>
                              </span>
                              Science Facts
                            </h4>
                            <div className="space-y-2 text-xs text-gray-600">
                              <div className="p-2 bg-blue-50/50 rounded border border-blue-100">
                                <span className="font-medium">Absorption:</span> Peak levels in 30-60 minutes
                              </div>
                              <div className="p-2 bg-green-50/50 rounded border border-green-100">
                                <span className="font-medium">Metabolism:</span> Liver processes ~50% every {HALF_LIFE_HOURS}h
                              </div>
                              <div className="p-2 bg-purple-50/50 rounded border border-purple-100">
                                <span className="font-medium">Sleep impact:</span> &lt;50mg at bedtime is ideal
                              </div>
                            </div>
                          </div>

                          {/* Personal Impact */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <span className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                                <span className="text-green-600 text-xs">👤</span>
                              </span>
                              Your Timeline
                            </h4>
                            <div className="space-y-2 text-xs">
                              <div className="p-2 bg-amber-50 rounded border border-amber-100">
                                <div className="font-medium text-amber-700">Now</div>
                                <div className="text-gray-600">{mgAdj}mg enters bloodstream</div>
                              </div>
                              <div className="p-2 bg-blue-50 rounded border border-blue-100">
                                <div className="font-medium text-blue-700">In {HALF_LIFE_HOURS}h</div>
                                <div className="text-gray-600">{milestones[0]?.remaining}mg remaining</div>
                              </div>
                              <div className="p-2 bg-green-50 rounded border border-green-100">
                                <div className="font-medium text-green-700">At bedtime ({virtualHoursUntilBed.toFixed(1)}h)</div>
                                <div className="text-gray-600">{remainingAtBedtime}mg in your system</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Suggestion */}
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">💡 Tip:</span> {v.suggestion}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </DialogContent>
        </Dialog>
      </section>
    </main>
  );
};

export default Ask;




