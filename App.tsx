import React, { useState, useEffect } from 'react';
import { Home, Plus, Grid, User, ScanLine, X, Heart, Share2, Sparkles, Search } from 'lucide-react';
import { TabView, StarCard, Rarity } from './types';
import { initializeStorage, getCards, saveCard, deleteCard, toggleFavorite } from './services/storageService';
import { analyzeCardImage, CardAnalysis } from './services/geminiService';
import { Card3D } from './components/Card3D';
import { Button } from './components/Button';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabView>('home');
  const [cards, setCards] = useState<StarCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<StarCard | null>(null);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  
  // Creation Flow
  const [isCreating, setIsCreating] = useState(false);
  const [newImage, setNewImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CardAnalysis | null>(null);

  useEffect(() => {
    initializeStorage();
    loadCards();
  }, []);

  const loadCards = () => {
    setCards(getCards());
  };

  const filteredCards = filter === 'all' 
    ? cards 
    : cards.filter(c => c.isFavorite);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const imgUrl = ev.target.result as string;
          setNewImage(imgUrl);
          analyzeImage(imgUrl);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const analyzeImage = async (imgUrl: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeCardImage(imgUrl);
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveCard = () => {
    if (!newImage || !analysis) return;

    let rarity = Rarity.COMMON;
    if (analysis.rarityScore > 90) rarity = Rarity.LIMITED;
    else if (analysis.rarityScore > 80) rarity = Rarity.LEGENDARY;
    else if (analysis.rarityScore > 60) rarity = Rarity.RARE;

    const newCard: StarCard = {
      id: Date.now().toString(),
      imageUrl: newImage,
      name: analysis.name,
      group: analysis.group,
      vibe: analysis.vibe,
      rarity: rarity,
      createdAt: Date.now(),
      isFavorite: false,
      texture: 'glossy'
    };

    saveCard(newCard);
    loadCards();
    resetCreateFlow();
  };

  const resetCreateFlow = () => {
    setNewImage(null);
    setAnalysis(null);
    setIsCreating(false);
    setActiveTab('home');
  };

  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Stop flip or modal close
    const updated = toggleFavorite(id);
    setCards(updated);
    if (selectedCard?.id === id) {
      setSelectedCard(updated.find(c => c.id === id) || null);
    }
  };

  const handleDelete = () => {
    if (selectedCard) {
      deleteCard(selectedCard.id);
      loadCards();
      setSelectedCard(null);
    }
  };

  // --- Views ---

  const CreateView = () => (
    <div className="flex flex-col h-full pt-12 px-6 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">New Drop</h2>
        <button onClick={resetCreateFlow} className="p-2 rounded-full bg-surfaceHighlight text-gray-400 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {!newImage ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full aspect-[3/4] max-h-[500px] border-2 border-dashed border-zinc-800 rounded-[32px] flex flex-col items-center justify-center bg-surfaceHighlight/30 relative overflow-hidden group hover:border-zinc-600 transition-colors cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <ScanLine className="w-12 h-12 text-zinc-600 mb-4 group-hover:text-white transition-colors" />
            <p className="text-zinc-500 font-medium mb-8">Tap to upload photo</p>
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleFileSelect}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center animate-slide-up">
          {/* Card Preview Area */}
          <div className="relative mb-8 w-full flex justify-center">
            {isAnalyzing ? (
              <div className="w-[85vw] max-w-sm aspect-[2/3] rounded-[24px] bg-surfaceHighlight flex flex-col items-center justify-center relative overflow-hidden border border-white/5 shadow-2xl">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.5s_infinite]" />
                 <Sparkles className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
                 <p className="text-sm text-indigo-200 font-medium">Analyzing Aesthetics...</p>
              </div>
            ) : (
              <Card3D 
                card={{
                  id: 'preview',
                  imageUrl: newImage,
                  name: analysis?.name || 'Unknown',
                  group: analysis?.group || 'Unknown',
                  rarity: analysis?.rarityScore ? (
                    analysis.rarityScore > 90 ? Rarity.LIMITED : 
                    analysis.rarityScore > 80 ? Rarity.LEGENDARY : 
                    analysis.rarityScore > 60 ? Rarity.RARE : Rarity.COMMON
                  ) : Rarity.COMMON,
                  vibe: analysis?.vibe || 'Analyzing...',
                  createdAt: Date.now(),
                  isFavorite: false,
                  texture: 'glossy'
                }} 
                size="full"
                interactive={true}
                flippable={true} 
              />
            )}
          </div>

          {/* Edit / Confirm Area */}
          {!isAnalyzing && analysis && (
            <div className="w-full max-w-sm space-y-4 pb-24">
              <div className="grid grid-cols-2 gap-3">
                 <input 
                   value={analysis.group} 
                   onChange={(e) => setAnalysis({...analysis, group: e.target.value})}
                   placeholder="Group"
                   className="w-full bg-surfaceHighlight/50 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:bg-surfaceHighlight outline-none transition-colors"
                 />
                 <input 
                   value={analysis.name} 
                   onChange={(e) => setAnalysis({...analysis, name: e.target.value})}
                   placeholder="Idol Name"
                   className="w-full bg-surfaceHighlight/50 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white font-bold placeholder-zinc-500 focus:bg-surfaceHighlight outline-none transition-colors"
                 />
              </div>
              <Button onClick={handleSaveCard} variant="primary">Add to Collection</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const HomeView = () => (
    <div className="pb-32 px-4 pt-4">
      {/* Header */}
      <header className="flex flex-col gap-6 mb-8 pt-4 sticky top-0 bg-background/90 backdrop-blur-xl z-30 pb-4 border-b border-white/5 -mx-4 px-6">
        <div className="flex justify-between items-center">
           <h1 className="text-2xl font-bold tracking-tight">Gallery</h1>
           <div className="p-2 bg-surfaceHighlight rounded-full">
             <Search className="w-5 h-5 text-gray-400" />
           </div>
        </div>
        
        <div className="flex gap-6">
          <button 
            onClick={() => setFilter('all')}
            className={`text-lg font-medium transition-colors ${filter === 'all' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            All Cards
          </button>
          <button 
            onClick={() => setFilter('favorites')}
            className={`text-lg font-medium transition-colors ${filter === 'favorites' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Favorites
          </button>
        </div>
      </header>

      {/* Grid */}
      {filteredCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <Grid className="w-12 h-12 mb-4 text-zinc-600" />
          <p className="text-zinc-500">Collection empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 pb-8">
          {filteredCards.map((card, index) => (
            <div 
              key={card.id} 
              className="flex justify-center animate-fade-in" 
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Card3D 
                card={card} 
                size="md" 
                onClick={() => setSelectedCard(card)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-background text-white min-h-screen relative font-sans selection:bg-indigo-500/30">
      
      {/* View Content */}
      <main className="max-w-md mx-auto min-h-screen relative">
        {isCreating ? <CreateView /> : (
          activeTab === 'home' ? <HomeView /> : 
          <div className="flex items-center justify-center h-screen text-zinc-500">Profile Coming Soon</div>
        )}
      </main>

      {/* Navigation Dock */}
      {!isCreating && !selectedCard && (
        <div className="fixed bottom-8 left-0 right-0 z-40 flex justify-center pointer-events-none">
          <div className="pointer-events-auto glass-dock px-6 py-3 rounded-full flex items-center gap-8 shadow-2xl border border-white/10 ring-1 ring-black/50">
            <button 
              onClick={() => setActiveTab('home')}
              className={`p-2 rounded-full transition-all duration-300 ${activeTab === 'home' ? 'bg-white text-black scale-110' : 'text-zinc-400 hover:text-white'}`}
            >
              <Home className="w-6 h-6" />
            </button>
            
            <button 
              onClick={() => { setIsCreating(true); setActiveTab('create'); }}
              className="p-3 bg-surfaceHighlight rounded-full text-white hover:bg-zinc-700 hover:scale-105 transition-all border border-white/10 group"
            >
              <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            </button>

            <button 
              onClick={() => setActiveTab('profile')}
              className={`p-2 rounded-full transition-all duration-300 ${activeTab === 'profile' ? 'bg-white text-black scale-110' : 'text-zinc-400 hover:text-white'}`}
            >
              <User className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Overlay */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blurred Backdrop */}
          <div 
            className="absolute inset-0 bg-background/90 backdrop-blur-xl transition-opacity animate-fade-in"
            onClick={() => setSelectedCard(null)}
          />
          
          <div className="relative w-full max-w-sm flex flex-col items-center animate-slide-up z-10">
             {/* Header Actions */}
             <div className="w-full flex justify-between items-center mb-6 px-4">
                <button onClick={() => setSelectedCard(null)} className="p-2 bg-surfaceHighlight rounded-full hover:bg-zinc-700 transition-colors border border-white/5">
                  <X className="w-5 h-5 text-zinc-300" />
                </button>
                <div className="flex gap-3">
                   <button 
                     onClick={(e) => handleToggleFavorite(e, selectedCard.id)}
                     className={`p-3 rounded-full backdrop-blur-md transition-all border ${selectedCard.isFavorite ? 'bg-pink-500/10 border-pink-500/50 text-pink-500' : 'bg-surfaceHighlight border-white/5 text-zinc-400 hover:text-white'}`}
                   >
                     <Heart className={`w-5 h-5 ${selectedCard.isFavorite ? 'fill-current' : ''}`} />
                   </button>
                </div>
             </div>

             {/* Card */}
             <div className="mb-8 scale-100 animate-float">
               <Card3D 
                 card={selectedCard} 
                 size="full" 
                 interactive={true} 
                 flippable={true} // Enable flip in detail view
               />
             </div>
             
             {/* Actions */}
             <div className="flex gap-4 w-full px-4">
               <Button variant="secondary" onClick={handleDelete}>Delete</Button>
               <Button variant="primary" onClick={() => {
                   if (navigator.share) {
                     navigator.share({
                       title: `${selectedCard.name} - StarCard`,
                       text: `Check out my ${selectedCard.rarity} card of ${selectedCard.name}!`,
                       url: window.location.href
                     }).catch(console.error);
                   }
               }}>
                 <span className="flex items-center gap-2">
                   Share <Share2 className="w-4 h-4" />
                 </span>
               </Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}