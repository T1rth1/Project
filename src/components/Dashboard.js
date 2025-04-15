import StatCards from './StatCards';
import Charts from './Charts';
import Events from './Events';
import AIInsights from './AIInsights';

export default function Dashboard() {
  return (
    <div>
      {/* <h1 className="text-2xl font-bold mb-4">Security Dashboard</h1> */}
      <div className="mb-6">
        <StatCards />
      </div>
      <div className="mb-6">
        {/* <h2 className="text-xl font-semibold mb-2">Threat Analysis</h2> */}
        <Charts />
      </div>
      <div className="mb-6">
        {/* <h2 className="text-xl font-semibold mb-2">Live Security Events</h2> */}
        <Events />
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">AI Security Insights</h2>
        <AIInsights />
      </div>
    </div>
  );
}