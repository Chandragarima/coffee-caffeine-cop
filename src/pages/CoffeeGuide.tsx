import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coffee } from 'lucide-react';

interface CoffeeLayer {
  name: string;
  color: string;
  height: number;
}

interface CoffeeType {
  id: string;
  name: string;
  description: string;
  layers: CoffeeLayer[];
  category: 'espresso' | 'milk' | 'cold' | 'specialty';
  strength: 'mild' | 'medium' | 'strong';
  caffeine: string;
}

const coffeeTypes: CoffeeType[] = [
  {
    id: 'espresso',
    name: 'Espresso',
    description: 'Pure coffee shot with intense flavor and crema',
    layers: [
      { name: 'crema', color: 'hsl(30, 70%, 85%)', height: 15 },
      { name: 'espresso', color: 'hsl(25, 45%, 25%)', height: 85 }
    ],
    category: 'espresso',
    strength: 'strong',
    caffeine: '75mg'
  },
  {
    id: 'americano',
    name: 'Americano',
    description: 'Espresso diluted with hot water for a lighter taste',
    layers: [
      { name: 'water', color: 'hsl(210, 50%, 70%)', height: 70 },
      { name: 'espresso', color: 'hsl(25, 45%, 25%)', height: 30 }
    ],
    category: 'espresso',
    strength: 'medium',
    caffeine: '75mg'
  },
  {
    id: 'latte',
    name: 'Latte',
    description: 'Smooth espresso with steamed milk and light foam',
    layers: [
      { name: 'milk foam', color: 'hsl(40, 60%, 95%)', height: 20 },
      { name: 'steamed milk', color: 'hsl(40, 60%, 88%)', height: 65 },
      { name: 'espresso', color: 'hsl(25, 45%, 25%)', height: 15 }
    ],
    category: 'milk',
    strength: 'mild',
    caffeine: '75mg'
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    description: 'Equal parts espresso, steamed milk, and thick foam',
    layers: [
      { name: 'milk foam', color: 'hsl(40, 60%, 95%)', height: 40 },
      { name: 'steamed milk', color: 'hsl(40, 60%, 88%)', height: 30 },
      { name: 'espresso', color: 'hsl(25, 45%, 25%)', height: 30 }
    ],
    category: 'milk',
    strength: 'medium',
    caffeine: '75mg'
  },
  {
    id: 'macchiato',
    name: 'Macchiato',
    description: 'Espresso "marked" with a dollop of steamed milk',
    layers: [
      { name: 'milk foam', color: 'hsl(40, 60%, 95%)', height: 25 },
      { name: 'espresso', color: 'hsl(25, 45%, 25%)', height: 75 }
    ],
    category: 'espresso',
    strength: 'strong',
    caffeine: '75mg'
  },
  {
    id: 'mocha',
    name: 'Mocha',
    description: 'Coffee meets chocolate with steamed milk and foam',
    layers: [
      { name: 'whipped cream', color: 'hsl(40, 60%, 96%)', height: 15 },
      { name: 'steamed milk', color: 'hsl(40, 60%, 88%)', height: 45 },
      { name: 'chocolate syrup', color: 'hsl(25, 60%, 40%)', height: 20 },
      { name: 'espresso', color: 'hsl(25, 45%, 25%)', height: 20 }
    ],
    category: 'specialty',
    strength: 'medium',
    caffeine: '95mg'
  },
  {
    id: 'flat-white',
    name: 'Flat White',
    description: 'Strong coffee with microfoam milk and rich flavor',
    layers: [
      { name: 'microfoam', color: 'hsl(40, 60%, 92%)', height: 15 },
      { name: 'steamed milk', color: 'hsl(40, 60%, 88%)', height: 55 },
      { name: 'double espresso', color: 'hsl(25, 45%, 25%)', height: 30 }
    ],
    category: 'milk',
    strength: 'strong',
    caffeine: '150mg'
  },
  {
    id: 'cortado',
    name: 'Cortado',
    description: 'Equal parts espresso and warm milk with minimal foam',
    layers: [
      { name: 'warm milk', color: 'hsl(40, 60%, 88%)', height: 50 },
      { name: 'espresso', color: 'hsl(25, 45%, 25%)', height: 50 }
    ],
    category: 'milk',
    strength: 'medium',
    caffeine: '75mg'
  },
  {
    id: 'iced-coffee',
    name: 'Iced Coffee',
    description: 'Cold brewed coffee served over ice',
    layers: [
      { name: 'ice', color: 'hsl(200, 50%, 90%)', height: 30 },
      { name: 'cold coffee', color: 'hsl(25, 45%, 35%)', height: 70 }
    ],
    category: 'cold',
    strength: 'medium',
    caffeine: '120mg'
  },
  {
    id: 'frappuccino',
    name: 'Frappuccino',
    description: 'Blended coffee with ice, milk, and flavored syrups',
    layers: [
      { name: 'whipped cream', color: 'hsl(40, 60%, 96%)', height: 20 },
      { name: 'blended mixture', color: 'hsl(30, 40%, 75%)', height: 60 },
      { name: 'coffee base', color: 'hsl(25, 45%, 35%)', height: 20 }
    ],
    category: 'cold',
    strength: 'mild',
    caffeine: '95mg'
  },
  {
    id: 'affogato',
    name: 'Affogato',
    description: 'Vanilla ice cream "drowned" in hot espresso',
    layers: [
      { name: 'vanilla ice cream', color: 'hsl(45, 80%, 90%)', height: 60 },
      { name: 'hot espresso', color: 'hsl(25, 45%, 25%)', height: 40 }
    ],
    category: 'specialty',
    strength: 'medium',
    caffeine: '75mg'
  },
  {
    id: 'gibraltar',
    name: 'Gibraltar',
    description: 'Double espresso with steamed milk in a gibraltar glass',
    layers: [
      { name: 'steamed milk', color: 'hsl(40, 60%, 88%)', height: 60 },
      { name: 'double espresso', color: 'hsl(25, 45%, 25%)', height: 40 }
    ],
    category: 'milk',
    strength: 'strong',
    caffeine: '150mg'
  }
];

const CoffeeVisualizer: React.FC<{ coffee: CoffeeType }> = ({ coffee }) => {
  return (
    <div className="flex flex-col items-center">
      {/* Coffee Cup */}
      <div className="relative w-24 h-28 mb-4">
        {/* Cup Handle */}
        <div className="absolute -right-3 top-4 w-6 h-12 border-4 border-muted-foreground/30 rounded-r-full" />
        
        {/* Cup Body */}
        <div className="w-24 h-24 border-4 border-muted-foreground/30 rounded-b-lg bg-card overflow-hidden relative">
          {/* Coffee Layers */}
          <div className="absolute bottom-0 left-0 right-0 h-full flex flex-col-reverse">
            {coffee.layers.map((layer, index) => (
              <div
                key={index}
                className="relative transition-all duration-300"
                style={{
                  backgroundColor: layer.color,
                  height: `${layer.height}%`,
                  borderTop: index === coffee.layers.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.3)'
                }}
              >
                {/* Add some visual texture for foam layers */}
                {layer.name.includes('foam') && (
                  <div className="absolute inset-0 opacity-30">
                    <div className="w-full h-full bg-gradient-to-t from-transparent via-white/20 to-white/40" />
                  </div>
                )}
                {/* Add ice cubes visual effect */}
                {layer.name === 'ice' && (
                  <div className="absolute inset-0 opacity-60">
                    <div className="w-2 h-2 bg-white/80 rounded-sm absolute top-1 left-2" />
                    <div className="w-2 h-2 bg-white/80 rounded-sm absolute top-3 right-3" />
                    <div className="w-2 h-2 bg-white/80 rounded-sm absolute bottom-2 left-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Cup Base */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-muted-foreground/20 rounded-b-lg" />
      </div>
      
      {/* Coffee Name */}
      <h3 className="text-lg font-bold text-foreground text-center mb-1">{coffee.name}</h3>
      
      {/* Badges */}
      <div className="flex gap-1 mb-2">
        <Badge 
          variant="outline" 
          className={`text-xs px-2 py-1 ${
            coffee.strength === 'strong' ? 'bg-red-50 text-red-700 border-red-200' :
            coffee.strength === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            'bg-green-50 text-green-700 border-green-200'
          }`}
        >
          {coffee.strength}
        </Badge>
        <Badge variant="secondary" className="text-xs px-2 py-1">
          {coffee.caffeine}
        </Badge>
      </div>
    </div>
  );
};

const CoffeeGuide: React.FC = () => {
  const categories = [
    { id: 'espresso', name: 'Espresso Based', icon: '☕' },
    { id: 'milk', name: 'Milk Based', icon: '🥛' },
    { id: 'cold', name: 'Cold Drinks', icon: '🧊' },
    { id: 'specialty', name: 'Specialty', icon: '✨' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-1 w-16 bg-gradient-to-r from-transparent to-amber-600 rounded-full" />
            <h1 className="text-4xl md:text-6xl font-black text-amber-900 tracking-wide">
              COFFEE
            </h1>
            <div className="h-1 w-16 bg-gradient-to-l from-transparent to-amber-600 rounded-full" />
          </div>
          <p className="text-2xl md:text-3xl font-light text-amber-700 italic -mt-2">guide</p>
          <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto leading-relaxed">
            Discover the perfect coffee for your taste. From strong espressos to creamy lattes, 
            find your ideal drink with our visual guide.
          </p>
        </div>

        {/* Coffee Categories */}
        {categories.map((category) => {
          const categoryTypes = coffeeTypes.filter(coffee => coffee.category === category.id);
          
          return (
            <div key={category.id} className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-3xl">{category.icon}</span>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">{category.name}</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categoryTypes.map((coffee) => (
                  <Card 
                    key={coffee.id} 
                    className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105 cursor-pointer"
                  >
                    <CardContent className="p-6">
                      <CoffeeVisualizer coffee={coffee} />
                      <p className="text-xs text-muted-foreground text-center leading-relaxed mt-3">
                        {coffee.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <Card className="mt-16 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Coffee className="h-6 w-6 text-primary" />
              How to Read the Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-foreground">Visual Layers</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gradient-to-b from-amber-200 to-amber-100 rounded-sm border" />
                    <span>Foam & Crema</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gradient-to-b from-amber-100 to-orange-100 rounded-sm border" />
                    <span>Steamed Milk</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gradient-to-b from-amber-800 to-amber-900 rounded-sm border" />
                    <span>Espresso</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gradient-to-b from-blue-200 to-blue-100 rounded-sm border" />
                    <span>Water & Ice</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-foreground">Strength Guide</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">mild</Badge>
                    <span>Light coffee flavor, more milk</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">medium</Badge>
                    <span>Balanced coffee and milk</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">strong</Badge>
                    <span>Bold coffee flavor</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoffeeGuide;