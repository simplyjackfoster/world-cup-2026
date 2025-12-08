import { NavLink, Route, Routes } from 'react-router-dom';
import Bracket from './components/Bracket';
import GroupGrid from './components/GroupGrid';
import HostCityExplorer from './components/HostCityExplorer';
import MyTeams from './components/MyTeams';
import GroupDetail from './components/GroupDetail';
import GroupControls from './components/GroupControls';
import DraftKingsOddsPanel from './components/DraftKingsOddsPanel';
import { useState } from 'react';

const navClasses = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm font-semibold border-b-2 transition ${
    isActive ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-accent'
  }`;

function App() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-night text-gold">
      <header className="sticky top-0 z-20 bg-pitch/90 border-b border-border backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md border border-border bg-white" />
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted">World Cup 2026 Control</p>
              <h1 className="text-xl font-semibold text-gold">Match Intelligence</h1>
            </div>
          </div>
          <nav className="flex gap-6 text-sm">
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
                  <GroupControls />
                  <GroupGrid onSelectGroup={setSelectedGroup} />
                  {selectedGroup && <GroupDetail groupId={selectedGroup} onClose={() => setSelectedGroup(null)} />}
                </div>
                <div className="space-y-4">
                  <DraftKingsOddsPanel />
                  <MyTeams />
                </div>
              </div>
            }
          />
          <Route path="/bracket" element={<Bracket />} />
          <Route path="/host-cities" element={<HostCityExplorer />} />
          <Route
            path="/favorites"
            element={
              <div className="mt-6 space-y-4">
                <MyTeams />
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
