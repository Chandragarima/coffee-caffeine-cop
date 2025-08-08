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
import { getMilestones } from "@/lib/caffeine";

const categoryLabels: Record<CoffeeCategory, string> = {
  espresso: "Espresso",
  milk: "Milk Based",
  water: "Water Brewed",
  tea: "Tea",
  cold: "Cold",
  specialty: "Specialty",
};

const Ask = () => {
  const [time, setTime] = useState<TimeOfDay>(getTimeOfDay());
  const [energy, setEnergy] = useState<EnergyLevel>(defaultEnergyForTime[time]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selected, setSelected] = useState<CoffeeItem | null>(null);

  const best = useMemo(() => bestPicksForTime(time, energy), [time, energy]);

  useEffect(() => {
    document.title = "Ask CoffeePolice – Smart coffee picks";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Browse coffees, see half-life charts, and get time-smart picks.");
  }, []);

  const renderCard = (c: CoffeeItem) => (
    <Card key={c.id} className="hover-scale cursor-pointer" onClick={() => setSelected(c)}>
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-foreground">{c.name}</div>
            <div className="text-xs text-muted-foreground">{c.description}</div>
          </div>
          <div className="text-sm text-muted-foreground">{c.caffeineMg} mg</div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main className="min-h-screen bg-background">
      <section className="px-4 py-6 max-w-screen-md mx-auto">
        <header className="mb-6 animate-enter">
          <div className="flex items-center gap-3">
            <img
              src="/lovable-uploads/31c42cd4-bee4-40d8-ba66-0438b1c8dc85.png"
              alt="CoffeePolice mascot logo"
              className="h-10 w-10 rounded-md"
              loading="lazy"
            />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Ask CoffeePolice</h1>
              <p className="text-muted-foreground text-sm">Time‑aware picks with caffeine half‑life guidance.</p>
            </div>
          </div>
        </header>

        <section className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1 text-muted-foreground">Time of day</label>
            <Select value={time} onValueChange={(v: TimeOfDay) => { setTime(v); setEnergy(defaultEnergyForTime[v]); }}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select time" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
                <SelectItem value="late_night">Late night</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm mb-1 text-muted-foreground">Energy level</label>
            <Select value={energy} onValueChange={(v: EnergyLevel) => setEnergy(v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select energy" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <article className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-foreground">Best pick right now</h2>
            <Badge variant="secondary" className="hover-scale">{time.replace("_", " ")} · {energy}</Badge>
          </div>
          <div className="grid sm:grid-cols-3 grid-cols-1 gap-3">
            {best.map((c) => (
              <Card key={c.id} className="animate-enter hover-scale cursor-pointer" onClick={() => setSelected(c)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{c.name}</span>
                    <span className="text-sm text-muted-foreground">{c.caffeineMg} mg</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{c.description}</CardContent>
              </Card>
            ))}
          </div>
        </article>

        <article>
          <h2 className="text-lg font-semibold text-foreground mb-3">Browse by category</h2>
          <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="all" className="w-full">
            <TabsList className="flex flex-wrap">
              <TabsTrigger value="all">All</TabsTrigger>
              {(Object.keys(categoryLabels) as CoffeeCategory[]).map((cat) => (
                <TabsTrigger key={cat} value={cat}>{categoryLabels[cat]}</TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <div className="grid sm:grid-cols-2 gap-3">
                {COFFEES.map(renderCard)}
              </div>
            </TabsContent>
            {(Object.keys(categoryLabels) as CoffeeCategory[]).map((cat) => (
              <TabsContent key={cat} value={cat} className="mt-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  {byCategory(cat).map(renderCard)}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </article>

        <div className="mt-8 text-center">
          <Link to="/">
            <Button variant="ghost">Back to Home</Button>
          </Link>
        </div>

        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="sm:max-w-lg">
            {selected && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>{selected.name}</span>
                    <Badge variant="outline">{selected.caffeineMg} mg</Badge>
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">{selected.description}</p>
                <div className="mt-3">
                  <h3 className="text-sm font-medium mb-2">Caffeine decay (t½ {HALF_LIFE_HOURS}h)</h3>
                  <DecayChart mg={selected.caffeineMg} halfLife={HALF_LIFE_HOURS} />
                  <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    {getMilestones(selected.caffeineMg, HALF_LIFE_HOURS).map((m) => (
                      <li key={m.label} className="rounded-md border p-2">
                        <div className="font-medium">{m.label}</div>
                        <div className="text-muted-foreground">~{m.hours}h · {m.remaining} mg</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </section>
    </main>
  );
};

export default Ask;

