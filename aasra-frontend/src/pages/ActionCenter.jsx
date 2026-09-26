import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Building,
  Check,
  RotateCcw
} from 'lucide-react';

const ActionCenter = () => {
  const { actionList, toggleActionStatus, totalActionsCount, completedActionsCount, pendingActionsCount } =
    useContext(AppContext);

  const [activeTab, setActiveTab] = useState('all');

  const filteredActions = actionList.filter((item) => {
    if (activeTab === 'pending') return item.status !== 'completed';
    if (activeTab === 'completed') return item.status === 'completed';
    if (activeTab === 'urgent') return item.priority === 'urgent' || item.priority === 'high';
    return true;
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 text-urgent border-red-200';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'low':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Prominent Placeholder Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-textPrimary tracking-tight">
              Action Center
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              Module Preview / Placeholder
            </span>
          </div>
          <p className="text-sm text-textSecondary mt-1">
            Prioritized tasks, statutory claim submissions, and closure checklists.
          </p>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-textMuted">Total Actions</p>
            <p className="text-xl font-bold text-textPrimary">{totalActionsCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-pending flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-textMuted">Pending Tasks</p>
            <p className="text-xl font-bold text-pending">{pendingActionsCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-success flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-textMuted">Resolved Actions</p>
            <p className="text-xl font-bold text-success">{completedActionsCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'all'
              ? 'bg-primary text-white'
              : 'text-textSecondary hover:text-textPrimary hover:bg-subtle'
          }`}
        >
          All Tasks ({totalActionsCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'pending'
              ? 'bg-primary text-white'
              : 'text-textSecondary hover:text-textPrimary hover:bg-subtle'
          }`}
        >
          Pending ({pendingActionsCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('urgent')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'urgent'
              ? 'bg-primary text-white'
              : 'text-textSecondary hover:text-textPrimary hover:bg-subtle'
          }`}
        >
          High & Urgent Priority
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'completed'
              ? 'bg-primary text-white'
              : 'text-textSecondary hover:text-textPrimary hover:bg-subtle'
          }`}
        >
          Completed ({completedActionsCount})
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredActions.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-border text-center text-textMuted text-sm">
            No action items match the selected filter.
          </div>
        ) : (
          filteredActions.map((action) => {
            const isCompleted = action.status === 'completed';
            return (
              <div
                key={action.id}
                className={`p-4 sm:p-5 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-50/80 border-border opacity-75'
                    : 'bg-white border-border shadow-xs hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Interactive Completion Button */}
                    <button
                      type="button"
                      aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                      onClick={() => toggleActionStatus(action.id)}
                      className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center border transition-colors cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 hover:border-primary text-transparent hover:text-primary/40'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityBadge(
                            action.priority
                          )}`}
                        >
                          {action.priority}
                        </span>
                        <span className="text-xs text-textSecondary flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-textMuted" />
                          {action.institution}
                        </span>
                        <span className="text-xs text-textMuted">• {action.category}</span>
                        {action.stage && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {action.stage}
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-base font-semibold ${
                          isCompleted ? 'line-through text-textMuted' : 'text-textPrimary'
                        }`}
                      >
                        {action.title}
                      </h3>

                      {action.description && (
                        <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
                          {action.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs text-textMuted pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Due: {action.due || action.dueDate}
                        </span>
                        {action.requiredDocIds && action.requiredDocIds.length > 0 && (
                          <span>Requires {action.requiredDocIds.length} Document(s)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => toggleActionStatus(action.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                        isCompleted
                          ? 'border-border text-textSecondary hover:bg-slate-200'
                          : 'bg-primary text-white border-primary hover:bg-primary-hover'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reopen</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Resolved</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Information Banner */}
      <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3 text-xs text-textSecondary">
        <AlertTriangle className="w-5 h-5 text-pending flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-textPrimary">Automated Authority Notice</p>
          <p className="mt-0.5">
            Connecting institutional APIs for EPFO online claims and LIC death intimations is under development.
            Clicking checkboxes updates your case progress tracker immediately in local state.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActionCenter;
