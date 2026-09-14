// =============================================================
// RouteWise — Root Application
// =============================================================
// State-machine router connecting all screens.
// FormData flows from PlannerForm → Loading → Overview → etc.
// =============================================================

import { useState } from 'react';
import LandingPage from './screens/LandingPage';
import PlannerForm from './screens/PlannerForm';
import LoadingScreen from './screens/LoadingScreen';
import TripOverview from './screens/TripOverview';
import DayDetail from './screens/DayDetail';
import TripAdjust from './screens/TripAdjust';
import PreTripChecklist from './screens/PreTripChecklist';
import type { FormData } from './screens/PlannerForm';

export type Screen =
  | 'landing'
  | 'planner'
  | 'loading'
  | 'overview'
  | 'day-detail'
  | 'adjust'
  | 'checklist';

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [selectedDay, setSelectedDay] = useState(1);

  const navigate = (s: Screen) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setScreen(s);
  };

  const goHome = () => navigate('landing');
  const planNew = () => navigate('planner');

  const totalDays = formData?.days ? Math.min(Number(formData.days), 5) : 5;

  return (
    <div style={{ fontFamily: 'Outfit, system-ui, sans-serif', minHeight: '100vh', background: '#F7F4EF' }}>
      {screen === 'landing' && <LandingPage onStart={() => navigate('planner')} />}

      {screen === 'planner' && (
        <PlannerForm
          onBack={goHome}
          onSubmit={(data) => {
            setFormData(data);
            navigate('loading');
          }}
          onHome={goHome}
        />
      )}

      {screen === 'loading' && (
        <LoadingScreen
          formData={formData}
          onDone={() => navigate('overview')}
        />
      )}

      {screen === 'overview' && (
        <TripOverview
          formData={formData}
          onHome={goHome}
          onPlanNew={planNew}
          onDayClick={(d) => { setSelectedDay(d); navigate('day-detail'); }}
          onAdjust={() => navigate('adjust')}
          onChecklist={() => navigate('checklist')}
        />
      )}

      {screen === 'day-detail' && (
        <DayDetail
          day={selectedDay}
          totalDays={totalDays}
          formData={formData}
          onBack={() => navigate('overview')}
          onHome={goHome}
          onPlanNew={planNew}
          onNext={() => { setSelectedDay(d => Math.min(d + 1, totalDays)); navigate('day-detail'); }}
          onPrev={() => { setSelectedDay(d => Math.max(d - 1, 1)); navigate('day-detail'); }}
        />
      )}

      {screen === 'adjust' && (
        <TripAdjust
          formData={formData}
          onBack={() => navigate('overview')}
          onHome={goHome}
          onReplan={(updated) => {
            setFormData(updated);
            navigate('loading');
          }}
        />
      )}

      {screen === 'checklist' && (
        <PreTripChecklist
          formData={formData}
          onBack={() => navigate('overview')}
          onHome={goHome}
        />
      )}
    </div>
  );
}
