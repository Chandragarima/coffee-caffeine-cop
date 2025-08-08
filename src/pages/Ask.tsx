import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { byCategory, COFFEES, CoffeeCategory } from "@/data/coffee";
import { getTimeOfDay } from "@/hooks/useTimeOfDay";
import { bestPicksForTime } from "@/lib/recommendation";

const categoryLabels: Record<CoffeeCategory, string> = {
  espresso: "Espresso",
  milk: "Milk Based",
  water: "Water Brewed",
  tea: "Tea",
  cold: "Cold",
  specialty: "Specialty",
};

const greet = (t: ReturnType<typeof getTimeOfDay>) => {
  switch (t) {
    case "morning":
      return "Good morning, coffee cadet!";
    case "afternoon":
      return "Good afternoon, caffeine cruiser!";
    case "evening":
      return "Evening patrol! Easy does it.";
    default:
      return "Late-night watch. Go gentle.";
  }
};

const Ask = () => {
  const time = useMemo(() => getTimeOfDay(), []);
  const best = useMemo(() => bestPicksForTime(time), [time]);

  useEffect(() => {
    document.title = "Ask Coffee Police – Best pick now";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "See the best coffee pick right now based on your local time.");
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <section className="px-4 py-6 max-w-screen-sm mx-auto">
        <header className="mb-4 animate-fade-in">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Ask Coffee Police</h1>
          <p className="text-muted-foreground mt-1">{greet(time)} We use your local time to suggest the smartest sip.</p>
        </header>

        <article className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-foreground">Best pick right now</h2>
            <Badge variant="secondary" className="hover-scale">{time.replace("_", " ")}</Badge>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {best.map((c) => (
              <Card key={c.id} className="animate-enter">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{c.name}</span>
                    <span className="text-sm text-muted-foreground">{c.caffeineMg} mg</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {c.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </article>

        <article>
          <h2 className="text-lg font-semibold text-foreground mb-3">Browse by category</h2>
          <div className="space-y-5">
            {(Object.keys(categoryLabels) as CoffeeCategory[]).map((cat) => (
              <div key={cat}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-foreground">{categoryLabels[cat]}</h3>
                  <Badge variant="outline">{byCategory(cat).length}</Badge>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {byCategory(cat).map((c) => (
                    <Card key={c.id} className="hover-scale">
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
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        <div className="mt-8 text-center">
          <Link to="/">
            <Button variant="ghost">Back to Home</Button>
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Ask;
