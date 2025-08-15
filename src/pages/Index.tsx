// Home hero with branding and CTA

const Index = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-background">
      <section className="text-center px-6 max-w-2xl animate-enter">
        <img
          src="/lovable-uploads/31c42cd4-bee4-40d8-ba66-0438b1c8dc85.png"
          alt="CoffeePolice mascot logo"
          className="mx-auto mb-5 h-24 w-24 rounded-xl shadow-md hover-scale"
          loading="eager"
        />
        <h1 className="text-4xl font-bold mb-3 text-foreground">CoffeePolice</h1>
        <p className="text-lg text-muted-foreground mb-6">Your cheeky caffeine cop—smarter sips, better sleep.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/ask" className="inline-block">
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90">
              Ask Coffee Police
            </button>
          </a>
          <a href="/caffeine-tracker" className="inline-block">
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-6 bg-secondary text-secondary-foreground hover:bg-secondary/90 border border-input">
              Track Caffeine
            </button>
          </a>
        </div>

        <div className="mt-10 text-left mx-auto max-w-xl">
          <h2 className="text-xl font-semibold mb-2">What’s CoffeePolice?</h2>
          <p className="text-muted-foreground">A playful guide to keep your caffeine in check. Browse coffees by category, see caffeine half-life charts, and get time-smart recommendations—all in one sip.</p>
        </div>
      </section>
    </main>
  );
};

export default Index;
