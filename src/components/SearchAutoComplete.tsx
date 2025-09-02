import { useState, useEffect, useRef } from "react";
import { CoffeeItem } from "@/data/coffees";
import { Badge } from "@/components/ui/badge";

interface SearchAutoCompleteProps {
  suggestions: CoffeeItem[];
  onSelect: (coffee: CoffeeItem) => void;
  searchQuery: string;
  isVisible: boolean;
  onClose: () => void;
}

export const SearchAutoComplete = ({ 
  suggestions, 
  onSelect, 
  searchQuery, 
  isVisible, 
  onClose 
}: SearchAutoCompleteProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (suggestions[selectedIndex]) {
            onSelect(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, selectedIndex, suggestions, onSelect, onClose]);

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-amber-100 text-amber-800 font-semibold">
          {part}
        </span>
      ) : part
    );
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      brewed: "bg-amber-100 text-amber-800",
      espresso: "bg-orange-100 text-orange-800", 
      milk: "bg-blue-100 text-blue-800",
      cold: "bg-cyan-100 text-cyan-800",
      tea: "bg-green-100 text-green-800",
      specialty: "bg-purple-100 text-purple-800",
      energy: "bg-red-100 text-red-800",
      soda: "bg-pink-100 text-pink-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (!isVisible || suggestions.length === 0) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto"
    >
      {suggestions.slice(0, 8).map((coffee, index) => (
        <div
          key={coffee.id}
          onClick={() => onSelect(coffee)}
          className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-150 ${
            index === selectedIndex 
              ? 'bg-amber-50 border-l-4 border-amber-400' 
              : 'hover:bg-gray-50'
          } ${index === suggestions.length - 1 ? '' : 'border-b border-gray-100'}`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900 truncate">
                {highlightMatch(coffee.name, searchQuery)}
              </span>
              <Badge 
                variant="secondary" 
                className={`text-xs px-2 py-0.5 ${getCategoryColor(coffee.category)}`}
              >
                {coffee.category}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              {coffee.caffeineMg}mg caffeine
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};