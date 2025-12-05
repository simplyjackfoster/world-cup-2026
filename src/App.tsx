import { NavLink, Route, Routes } from 'react-router-dom';
import Bracket from './components/Bracket';
import GroupGrid from './components/GroupGrid';
import HostCityExplorer from './components/HostCityExplorer';
import MyTeams from './components/MyTeams';
import GroupDetail from './components/GroupDetail';
import { useState } from 'react';
import GroupRankingsPanel from './components/GroupRankingsPanel';

const navClasses = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-2 rounded-full text-sm font-semibold transition ${
    isActive ? 'bg-accent text-night' : 'bg-pitch text-slate-200 hover:bg-slate-800'
  }`;

function App() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-night text-slate-100">
      <header className="sticky top-0 z-20 bg-night/80 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-gold" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">FIFA World Cup 2026</p>
              <h1 className="text-xl font-semibold">North America Showcase</h1>
            </div>
          </div>
          <nav className="flex gap-2 text-sm">
            <NavLink to="/" className={navClasses} end>
              Groups
            </NavLink>
            <NavLink to="/bracket" className={navClasses}>
              Bracket
            </NavLink>
            <NavLink to="/host-cities" className={navClasses}>
              Host Cities
            </NavLink>
            <NavLink to="/favorites" className={navClasses}>
              My Picks
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-16">
        <Routes>
          <Route
            path="/"
            element={
              <div className="grid lg:grid-cols-[2fr_1fr] gap-6 mt-6">
                <div className="space-y-4">
                  <GroupGrid onSelectGroup={setSelectedGroup} />
                  {selectedGroup && <GroupDetail groupId={selectedGroup} onClose={() => setSelectedGroup(null)} />}
                </div>
                <div className="space-y-4">
                  <MyTeams />
                  <GroupRankingsPanel />
                </div>
              </div>
            }
          />
          <Route path="/bracket" element={<Bracket />} />
          <Route path="/host-cities" element={<HostCityExplorer />} />
          <Route
            path="/favorites"
            element={
              <div className="grid lg:grid-cols-[2fr_1fr] gap-6 mt-6">
                <MyTeams />
                <GroupRankingsPanel />
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
