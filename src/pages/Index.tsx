// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <section className="text-center px-6 animate-fade-in">
        <h1 className="text-4xl font-bold mb-3 text-foreground">CoffeePolice</h1>
        <p className="text-lg text-muted-foreground mb-6">Your cheeky caffeine cop. Smarter sips, better sleep.</p>
        <a href="/ask" className="inline-block">
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90">
            Ask Coffee Police
          </button>
        </a>
      </section>
    </main>
  );
};

export default Index;
