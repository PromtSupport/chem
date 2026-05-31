import React, { useState } from 'react';
import { Leaf } from 'lucide-react';

interface ChemicalStructureProps {
  name: string;
  formula?: string;
  imageUrl?: string;
}

const getImageUrl = (name: string): string => {
  const nameLower = name.toLowerCase();
  
  // 1. Глюкоза (Фрукты, виноград)
  if (nameLower.includes('глюкоза')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/d/df/ConcordGrapes.jpg';
  }
  // 2. Сахароза (Сахар)
  if (nameLower.includes('сахароза')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/W%C3%BCrfelzucker_--_2018_--_3582.jpg/1280px-W%C3%BCrfelzucker_--_2018_--_3582.jpg';
  }
  // 3. Натуральный каучук (Резина, шины)
  if (nameLower.includes('каучук')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Large_tyre.jpg/1280px-Large_tyre.jpg';
  }
  // 4. Метанол (Древесный спирт, темный лес)
  if (nameLower.includes('метанол')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Brennreisig.JPG/1280px-Brennreisig.JPG';
  }
  // 5. Глицерин (Масла, капли)
  if (nameLower.includes('глицерин')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Handmade_soap_cropped_and_simplified.jpg';
  }
  // 6. Белки (Белковая пища: творог)
  if (nameLower.includes('белк') || nameLower.includes('амино')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Cottagecheese200px.jpg/1280px-Cottagecheese200px.jpg';
  }

  // Fallbacks:
  // Фруктоза
  if (nameLower.includes('фруктоза')) return 'https://upload.wikimedia.org/wikipedia/commons/d/df/ConcordGrapes.jpg';
  // Этанол
  if (nameLower.includes('этанол') || nameLower.includes('спирт')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Methanol_by_Danny_S._-_001.JPG/960px-Methanol_by_Danny_S._-_001.JPG';
  
  // Ultimate natural fallback (вода, кристаллы, космос и др.)
  return 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Water_drop_impact_on_a_water-surface_-_%282%29.jpg/1280px-Water_drop_impact_on_a_water-surface_-_%282%29.jpg';
}

export default function ChemicalStructure({ name, imageUrl: customImageUrl }: ChemicalStructureProps) {
  const [hasError, setHasError] = useState(false);
  
  const imageUrl = customImageUrl || getImageUrl(name);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center text-slate-500 gap-3 w-full h-full bg-black/40">
        <Leaf size={32} />
        <span className="text-xs uppercase tracking-widest font-mono font-bold">Нет изображения</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative cursor-pointer group overflow-hidden bg-[#050b14]">
      {/* Overlay gradient to blend nicely with the dark UI */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 pointer-events-none transition-opacity duration-500 opacity-90 group-hover:opacity-70"></div>
      
      {/* Glow overlay */}
      <div className="absolute inset-0 bg-emeraldAccent/10 mix-blend-color z-10 pointer-events-none"></div>

      <img 
        src={imageUrl} 
        alt={`Где встречается ${name} в природе`}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 saturate-[0.8] contrast-[1.1] brightness-[0.8]"
      />
    </div>
  );
}
