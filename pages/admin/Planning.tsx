
import React, { useState } from 'react';
import { Calendar, Clock, Mic2, Briefcase, Plus, X, CheckCircle2, Circle, Calculator, Zap, ChevronLeft, ChevronRight, CalendarDays, Music } from 'lucide-react';
import { MOCK_EVENTS } from '../../constants';
import { ScheduleEvent } from '../../types';

export const Planning: React.FC = () => {
  const [events, setEvents] = useState<ScheduleEvent[]>(MOCK_EVENTS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // INIT AU 6 DECEMBRE 2025 (Démarrage Micro-Entreprise)
  const [currentDate, setCurrentDate] = useState(new Date('2025-12-06T12:00:00'));

  const [newEvent, setNewEvent] = useState({
      title: '',
      date: '2025-12-06',
      time: '14:00',
      type: 'STUDIO' as 'STUDIO' | 'DEADLINE' | 'ADMIN',
      artist: '',
      notes: ''
  });

  // --- LOGIQUE CALENDRIER ---
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const changeWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date('2025-12-06T12:00:00')); // "Aujourd'hui" est le jour du lancement
  };

  const formatDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date) => {
    const today = new Date('2025-12-06T12:00:00'); // Simuler que "Aujourd'hui" est le 6 déc
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // --- LOGIQUE EVENTS ---

  const getEventIcon = (type: string) => {
      switch (type) {
          case 'STUDIO': return <Mic2 className="w-3 h-3" />;
          case 'DEADLINE': return <Clock className="w-3 h-3" />;
          case 'ADMIN': return <Briefcase className="w-3 h-3" />;
          default: return <Calendar className="w-3 h-3" />;
      }
  };

  const getEventColor = (type: string) => {
      switch (type) {
          case 'STUDIO': return 'bg-purple-900/20 border-purple-800 text-purple-300';
          case 'DEADLINE': return 'bg-red-900/20 border-red-800 text-red-300';
          case 'ADMIN': return 'bg-blue-900/20 border-blue-800 text-blue-300';
          default: return 'bg-gray-800 border-gray-700 text-gray-300';
      }
  };

  const handleAddEvent = (e: React.FormEvent) => {
      e.preventDefault();
      const event: ScheduleEvent = {
          id: Date.now().toString(),
          title: newEvent.title,
          date: newEvent.date,
          time: newEvent.time,
          type: newEvent.type,
          status: 'PENDING',
          artist: newEvent.artist,
          notes: newEvent.notes
      };
      setEvents(prev => [...prev, event]);
      setIsFormOpen(false);
      setNewEvent({ title: '', date: '2025-12-06', time: '14:00', type: 'STUDIO', artist: '', notes: '' });
  };

  const generateFiscalCalendar = () => {
      // Génère à partir de 2025 (année de création) et 2026/2027
      const years = [2025, 2026, 2027];
      const creationDate = new Date('2025-12-06');
      const newFiscalEvents: ScheduleEvent[] = [];

      years.forEach(year => {
          // Liste brute des échéances
          const rawEvents = [
              { id: `urssaf-t1-${year}`, title: '🏛 URSSAF T1', date: `${year}-04-30`, time: '12:00', type: 'ADMIN', status: 'PENDING', notes: 'Jan-Fev-Mar' },
              { id: `urssaf-t2-${year}`, title: '🏛 URSSAF T2', date: `${year}-07-31`, time: '12:00', type: 'ADMIN', status: 'PENDING', notes: 'Avr-Mai-Juin' },
              { id: `urssaf-t3-${year}`, title: '🏛 URSSAF T3', date: `${year}-10-31`, time: '12:00', type: 'ADMIN', status: 'PENDING', notes: 'Juil-Aou-Sep' },
              { id: `urssaf-t4-${year}`, title: '🏛 URSSAF T4', date: `${year + 1}-01-31`, time: '12:00', type: 'ADMIN', status: 'PENDING', notes: 'Oct-Nov-Dec' },
              { id: `cfe-${year}`, title: '🏢 Paiement CFE', date: `${year}-12-15`, time: '09:00', type: 'ADMIN', status: 'PENDING', notes: 'Impots.gouv' },
              { id: `impot-${year}`, title: '⚖️ Déclaration Revenus', date: `${year}-05-20`, time: '09:00', type: 'ADMIN', status: 'PENDING', notes: '2042-C-PRO + Annexes SACEM' },
              
              // SACEM
              { id: `sacem-jan-${year}`, title: '🎵 Répartition SACEM (Jan)', date: `${year}-01-05`, time: '09:00', type: 'DEADLINE', status: 'PENDING', notes: 'Vérifier virement et précompte' },
              { id: `sacem-avr-${year}`, title: '🎵 Répartition SACEM (Avr)', date: `${year}-04-05`, time: '09:00', type: 'DEADLINE', status: 'PENDING', notes: 'Vérifier virement et précompte' },
              { id: `sacem-jui-${year}`, title: '🎵 Répartition SACEM (Juil)', date: `${year}-07-05`, time: '09:00', type: 'DEADLINE', status: 'PENDING', notes: 'Vérifier virement et précompte' },
              { id: `sacem-oct-${year}`, title: '🎵 Répartition SACEM (Oct)', date: `${year}-10-05`, time: '09:00', type: 'DEADLINE', status: 'PENDING', notes: 'Vérifier virement et précompte' },
              { id: `sacem-tax-${year}`, title: '📄 Relevé Fiscal SACEM', date: `${year}-04-10`, time: '10:00', type: 'ADMIN', status: 'PENDING', notes: 'Télécharger pour déclaration impôts' },
              { id: `ircec-${year}`, title: '👴 Déclaration IRCEC (RAAP)', date: `${year}-06-01`, time: '10:00', type: 'ADMIN', status: 'PENDING', notes: 'Retraite Complémentaire Auteurs' }
          ];

          // Filtrer : On ne garde que les dates POSTÉRIEURES au 6 Déc 2025
          rawEvents.forEach(ev => {
              if (new Date(ev.date) >= creationDate) {
                  // Typage forcé pour éviter l'erreur TS
                  newFiscalEvents.push({
                      ...ev,
                      type: ev.type as 'ADMIN' | 'DEADLINE' | 'STUDIO',
                      status: ev.status as 'PENDING' | 'DONE'
                  });
              }
          });
      });

      const filteredNewEvents = newFiscalEvents.filter(ne => !events.some(e => e.id === ne.id));
      setEvents([...events, ...filteredNewEvents]);
      alert(`${filteredNewEvents.length} échéances ajoutées pour 2025-2027 (Post-création).`);
  };

  const toggleStatus = (id: string) => {
      setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status: ev.status === 'PENDING' ? 'DONE' : 'PENDING' } : ev));
  };

  return (
    <div className="pb-20 max-w-[1400px] mx-auto animate-in fade-in">
        {/* HEADER & ACTIONS */}
        <header className="mb-6 border-b border-[#3d2b1f] pb-6 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
            <div>
                <h1 className="text-3xl font-bold text-[#fff8f0] flex items-center gap-3">
                    <CalendarDays className="w-8 h-8 text-emerald-500" />
                    Planning Hebdomadaire
                </h1>
                <p className="text-[#a89080] mt-2">Vue d'ensemble (Démarrage : 6 Décembre 2025)</p>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                 <button 
                    onClick={generateFiscalCalendar}
                    className="bg-[#2a1e16] hover:bg-[#3d2b1f] text-[#d4a373] border border-[#3d2b1f] font-bold px-4 py-2 rounded-full flex items-center justify-center gap-2 transition-colors text-xs sm:text-sm"
                >
                    <Calculator className="w-4 h-4" />
                    Générer Échéances Futures
                </button>
                <button 
                    onClick={() => setIsFormOpen(true)}
                    className="bg-[#d4a373] hover:bg-[#e6b98e] text-[#1a120b] font-bold px-4 py-2 rounded-full flex items-center justify-center gap-2 transition-colors shadow-lg text-xs sm:text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Ajouter
                </button>
            </div>
        </header>

        {/* NAVIGATION SEMAINE */}
        <div className="flex items-center justify-between mb-6 bg-[#1e1510] p-3 rounded-xl border border-[#3d2b1f]">
            <button onClick={() => changeWeek('prev')} className="p-2 hover:bg-[#2a1e16] rounded-lg text-[#8c7a6b] transition-colors">
                <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-[#fff8f0] capitalize">
                    {startOfWeek.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={goToToday} className="text-xs font-bold bg-[#3d2b1f] text-amber-500 px-3 py-1 rounded-full hover:bg-[#4e3629] transition-colors">
                    Aller au 6 Déc 2025
                </button>
            </div>

            <button onClick={() => changeWeek('next')} className="p-2 hover:bg-[#2a1e16] rounded-lg text-[#8c7a6b] transition-colors">
                <ChevronRight className="w-6 h-6" />
            </button>
        </div>

        {/* MODAL AJOUT */}
        {isFormOpen && (
             <div className="mb-8 bg-[#2a1e16] border border-amber-900/50 rounded-xl p-6 relative animate-in zoom-in-95">
                <button onClick={() => setIsFormOpen(false)} className="absolute top-4 right-4 text-[#8c7a6b] hover:text-[#fff8f0]">
                    <X className="w-5 h-5" />
                </button>
                <h3 className="font-bold text-[#fff8f0] mb-4">Nouvel Événement</h3>
                <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="md:col-span-2">
                        <label className="block text-xs text-[#8c7a6b] mb-1">Titre</label>
                        <input type="text" required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full bg-[#1a120b] border border-[#3d2b1f] rounded-lg px-3 py-2 text-[#fff8f0] outline-none focus:border-amber-500" />
                     </div>
                     <div>
                        <label className="block text-xs text-[#8c7a6b] mb-1">Date</label>
                        <input type="date" required value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full bg-[#1a120b] border border-[#3d2b1f] rounded-lg px-3 py-2 text-[#fff8f0] outline-none focus:border-amber-500" />
                     </div>
                     <div>
                        <label className="block text-xs text-[#8c7a6b] mb-1">Heure</label>
                        <input type="time" required value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} className="w-full bg-[#1a120b] border border-[#3d2b1f] rounded-lg px-3 py-2 text-[#fff8f0] outline-none focus:border-amber-500" />
                     </div>
                     <div>
                        <label className="block text-xs text-[#8c7a6b] mb-1">Type</label>
                        <select value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value as any})} className="w-full bg-[#1a120b] border border-[#3d2b1f] rounded-lg px-3 py-2 text-[#fff8f0] outline-none focus:border-amber-500">
                            <option value="STUDIO">Session Studio</option>
                            <option value="DEADLINE">Deadline / Rendu</option>
                            <option value="ADMIN">Administratif</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs text-[#8c7a6b] mb-1">Artiste</label>
                        <input type="text" value={newEvent.artist} onChange={e => setNewEvent({...newEvent, artist: e.target.value})} className="w-full bg-[#1a120b] border border-[#3d2b1f] rounded-lg px-3 py-2 text-[#fff8f0] outline-none focus:border-amber-500" />
                     </div>
                     <button type="submit" className="md:col-span-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg mt-2">Enregistrer</button>
                </form>
             </div>
        )}

        {/* GRILLE SEMAINE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {weekDays.map((day, index) => {
                const dateKey = formatDateString(day);
                const dayEvents = events.filter(e => e.date === dateKey).sort((a, b) => a.time.localeCompare(b.time));
                const isCurrentDay = isToday(day);

                return (
                    <div key={index} className={`flex flex-col rounded-xl border min-h-[300px] bg-[#1a120b] ${isCurrentDay ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-[#3d2b1f]'}`}>
                        {/* HEADER JOUR */}
                        <div className={`p-3 border-b border-[#3d2b1f] ${isCurrentDay ? 'bg-amber-900/20' : 'bg-[#120a05]'}`}>
                            <p className={`text-xs uppercase font-bold tracking-wider ${isCurrentDay ? 'text-amber-500' : 'text-[#8c7a6b]'}`}>
                                {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                            </p>
                            <p className={`text-xl font-bold ${isCurrentDay ? 'text-[#fff8f0]' : 'text-[#d1d5db]'}`}>
                                {day.getDate()}
                            </p>
                        </div>

                        {/* CONTENU JOUR */}
                        <div className="flex-1 p-2 space-y-2">
                            {dayEvents.length === 0 ? (
                                <div className="h-full flex items-center justify-center opacity-20">
                                    <div className="w-1 h-1 bg-[#5c4a3e] rounded-full mx-1"></div>
                                    <div className="w-1 h-1 bg-[#5c4a3e] rounded-full mx-1"></div>
                                    <div className="w-1 h-1 bg-[#5c4a3e] rounded-full mx-1"></div>
                                </div>
                            ) : (
                                dayEvents.map(ev => (
                                    <div 
                                        key={ev.id} 
                                        className={`p-2 rounded-lg border text-left group transition-all relative ${ev.status === 'DONE' ? 'opacity-50 bg-[#120a05] border-transparent' : 'bg-[#1e1510] border-[#3d2b1f] hover:border-amber-600/50'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[10px] font-mono px-1 rounded ${getEventColor(ev.type)}`}>
                                                {ev.time}
                                            </span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); toggleStatus(ev.id); }}
                                                className="text-[#5c4a3e] hover:text-emerald-500"
                                            >
                                                {ev.status === 'DONE' ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                                            </button>
                                        </div>
                                        
                                        <p className={`text-xs font-bold leading-tight mb-1 ${ev.status === 'DONE' ? 'line-through text-[#5c4a3e]' : 'text-gray-200'}`}>
                                            {ev.title}
                                        </p>

                                        {ev.artist && (
                                            <p className="text-[10px] text-[#d4a373] truncate">ft. {ev.artist}</p>
                                        )}
                                        
                                        {(ev.id.includes('sacem') || ev.id.includes('ircec')) && (
                                            <div className="absolute top-1 right-6">
                                                <Music className="w-3 h-3 text-purple-400" />
                                            </div>
                                        )}
                                        
                                        {(ev.id.includes('urssaf') || ev.id.includes('cfe')) && (
                                            <div className="absolute top-1 right-6">
                                                <Zap className="w-3 h-3 text-blue-400" />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};
