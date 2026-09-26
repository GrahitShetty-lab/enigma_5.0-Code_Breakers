import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import {
  FileText,
  Shield,
  Building,
  CheckCircle,
  Clock,
  Circle,
  Calendar,
  User,
  Info
} from 'lucide-react';

const Timeline = () => {
  const { timelineList } = useContext(AppContext);

  const getMilestoneIcon = (iconName, status) => {
    if (status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-emerald-500 bg-white rounded-full" />;
    }
    if (status === 'inProgress') {
      return <Clock className="w-5 h-5 text-pending bg-white rounded-full" />;
    }

    switch (iconName) {
      case 'FileText':
        return <FileText className="w-5 h-5 text-slate-400 bg-white" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-slate-400 bg-white" />;
      case 'Building':
        return <Building className="w-5 h-5 text-slate-400 bg-white" />;
      case 'CheckCircle':
        return <CheckCircle className="w-5 h-5 text-slate-400 bg-white" />;
      default:
        return <Circle className="w-5 h-5 text-slate-400 bg-white" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'inProgress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'pending':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'inProgress':
        return 'In Progress';
      case 'pending':
        return 'Upcoming';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Prominent Placeholder Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-textPrimary tracking-tight">
              Closure Milestones Timeline
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              Module Preview / Placeholder
            </span>
          </div>
          <p className="text-sm text-textSecondary mt-1">
            Chronological audit trail of estate notifications, statutory claims, and closure milestones.
          </p>
        </div>
      </div>

      {/* Vertical Timeline Card */}
      <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-xs">
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {timelineList.map((item, index) => {
            const isCompleted = item.status === 'completed';
            const isInProgress = item.status === 'inProgress';

            return (
              <div key={item.id || index} className="relative group">
                {/* Node Marker */}
                <div className="absolute -left-6 sm:-left-8 top-1 flex items-center justify-center">
                  <div
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center bg-white shadow-xs ${
                      isCompleted
                        ? 'border-emerald-500'
                        : isInProgress
                        ? 'border-pending ring-4 ring-amber-100'
                        : 'border-slate-300'
                    }`}
                  >
                    {getMilestoneIcon(item.icon, item.status)}
                  </div>
                </div>

                {/* Milestone Content Box */}
                <div
                  className={`p-4 sm:p-5 rounded-xl border transition-all ${
                    isInProgress
                      ? 'bg-amber-50/30 border-amber-200 shadow-xs'
                      : isCompleted
                      ? 'bg-slate-50/50 border-border'
                      : 'bg-white border-border/80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-textPrimary text-base">
                        {item.title}
                      </h3>
                      {item.category && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                          {item.category}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs sm:text-sm text-textSecondary leading-relaxed mb-3">
                      {item.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-textMuted pt-2 border-t border-border/50">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      Target Date: {item.date}
                    </span>
                    {item.actor && (
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        Handled by: {item.actor}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Information Banner */}
      <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3 text-xs text-textSecondary">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-textPrimary">Audit Trail Certification</p>
          <p className="mt-0.5">
            All estate actions and document submissions will be exportable as an immutable PDF audit log for legal heir
            hearings, probate court, and tax authority filing once all claims reach closure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
