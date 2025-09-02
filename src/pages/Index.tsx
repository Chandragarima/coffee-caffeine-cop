// Home hero with branding and CTA

const Index = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-background px-4">
      <section className="text-center px-2 sm:px-6 max-w-2xl animate-enter">
        <img
          src="/lovable-uploads/64b50735-018a-49d7-8568-11d380b32163.png"
          alt="CoffeePolice mascot logo"
          className="mx-auto mb-4 sm:mb-5 h-16 w-16 sm:h-24 sm:w-24 rounded-xl shadow-md hover-scale"
          loading="eager"
        />
        <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3 text-foreground">CoffeePolice</h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6">Your cheeky caffeine cop—smarter sips, better sleep.</p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <a href="/ask" className="inline-block">
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 sm:h-11 px-4 sm:px-6 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
              Ask Coffee Police
            </button>
          </a>
          <a href="/smart-tracker" className="inline-block">
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 sm:h-11 px-4 sm:px-6 bg-secondary text-secondary-foreground hover:bg-secondary/90 border border-input w-full sm:w-auto">
              <span className="text-base sm:text-lg">🧬</span>
              Smart Tracker
            </button>
          </a>
        </div>

        <div className="mt-6 sm:mt-10 text-left mx-auto max-w-xl">
          <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">What's CoffeePolice?</h2>
          <p className="text-sm sm:text-base text-muted-foreground">A playful guide to keep your caffeine in check. Browse coffees, see caffeine charts, and get smart recommendations.</p>
        </div>
      </section>
    </main>
  );
};

export default Index;
