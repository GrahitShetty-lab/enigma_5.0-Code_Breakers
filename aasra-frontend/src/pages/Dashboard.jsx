import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  User,
  Shield,
  ArrowRight,
  Check,
  Building,
  Calendar
} from 'lucide-react';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

const Dashboard = () => {
  const {
    caseData,
    actionList,
    toggleActionStatus,
    totalAssets,
    totalLiabilities,
    pendingActionsCount,
    closureProgress,
    pieData,
  } = useContext(AppContext);

  // Filter pending attention items
  const attentionItems = actionList.filter((a) => a.status !== 'completed');
  // Fallback to all if everything completed
  const displayItems = attentionItems.length > 0 ? attentionItems : actionList.slice(0, 4);

  return (
    <section className="space-y-8 bg-background min-h-screen">
      {/* Active Case Banner */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-textPrimary tracking-tight">
                Case: {caseData?.deceasedName || 'Rahul Sharma'}
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {caseData?.caseStatus || 'Active Dossier'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-textSecondary mt-1">
              <span>Relation: <strong>{caseData?.relationship || 'Son'}</strong></span>
              <span>•</span>
              <span>PAN: <strong className="font-mono">{caseData?.pan || 'XXXXX1234X'}</strong></span>
              {caseData?.executorName && (
                <>
                  <span>•</span>
                  <span>Claimant: <strong>{caseData.executorName}</strong></span>
                </>
              )}
              {caseData?.dateOfDeath && (
                <>
                  <span>•</span>
                  <span>Passing: <strong>{caseData.dateOfDeath}</strong></span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <Link
            to="/setup"
            className="px-3.5 py-1.5 text-xs font-medium text-textSecondary hover:text-textPrimary bg-subtle hover:bg-slate-200 rounded-lg transition-colors"
          >
            Edit Case Profile
          </Link>
          <Link
            to="/actions"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-xs transition-colors"
          >
            <span>Action Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Financial closure overview header */}
      <div>
        <h1 className="text-2xl font-bold text-primary tracking-tight">
          Financial closure overview
        </h1>
        <p className="text-textSecondary text-sm mt-1">
          Here's what needs attention right now across estate assets, statutory claims, and liabilities.
        </p>
      </div>

      {/* Summary cards (AC4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-textMuted">Total Assets</p>
            <p className="text-xl font-bold text-textPrimary">₹{totalAssets.toLocaleString()}</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-urgent flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-textMuted">Liabilities</p>
            <p className="text-xl font-bold text-urgent">₹{totalLiabilities.toLocaleString()}</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-pending flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-textMuted">Pending Actions</p>
            <p className="text-xl font-bold text-textPrimary">{pendingActionsCount}</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-success flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-textMuted">Closure Progress</p>
            <p className="text-xl font-bold text-textPrimary">{closureProgress}%</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Needs Attention & Recharts Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Needs Attention list (AC4) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-border p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-lg font-bold text-textPrimary">Needs Attention</h2>
              <p className="text-xs text-textSecondary mt-0.5">
                Critical tasks requiring legal verification or claimant action
              </p>
            </div>
            <Link
              to="/actions"
              className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ul className="space-y-3">
            {displayItems.map((a) => {
              const isDone = a.status === 'completed';
              return (
                <li
                  key={a.id}
                  className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isDone
                      ? 'bg-slate-50/70 border-border opacity-70'
                      : 'bg-white border-border hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      aria-label={isDone ? 'Mark task pending' : 'Mark task complete'}
                      onClick={() => toggleActionStatus(a.id)}
                      className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-colors cursor-pointer ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 hover:border-primary text-transparent hover:text-primary/30'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                    <div className="space-y-1">
                      <p
                        className={`text-sm font-semibold ${
                          isDone ? 'line-through text-textMuted' : 'text-textPrimary'
                        }`}
                      >
                        {a.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-textSecondary">
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-textMuted" />
                          {a.institution}
                        </span>
                        {a.due && (
                          <span className="flex items-center gap-1 text-textMuted">
                            <Calendar className="w-3.5 h-3.5" />
                            Due {a.due}
                          </span>
                        )}
                        {a.priority && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              a.priority === 'urgent'
                                ? 'bg-red-50 text-urgent'
                                : a.priority === 'high'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {a.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/actions"
                    className="px-3 py-1 bg-primary text-white text-xs font-medium rounded hover:bg-primary-hover transition whitespace-nowrap self-center"
                  >
                    View Details
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Asset distribution pie chart (AC4) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-border p-6 shadow-xs space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-lg font-bold text-textPrimary">Asset Distribution</h2>
            <p className="text-xs text-textSecondary mt-0.5">
              Portfolio breakdown across banking, insurance, and investments
            </p>
          </div>

          <div className="w-full h-80 min-h-[300px] flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-textMuted">No asset data available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Valuation']}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Safety / Legal Advisory */}
      <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3 text-xs text-textSecondary">
        <Shield className="w-5 h-5 text-primary flex-shrink-0" />
        <p>
          All information is stored locally and protected under end-to-end client confidentiality standards.
          Estate asset transmissions adhere to the Indian Succession Act, 1925 and RBI Master Directions.
        </p>
      </div>
    </section>
  );
};

export default Dashboard;
