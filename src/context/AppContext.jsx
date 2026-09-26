// src/context/AppContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import {
  caseInfo as initialCaseInfo,
  assets as initialAssets,
  actions as initialActions,
  documents as initialDocuments,
  timeline as initialTimeline,
} from '../data/mockData';

// oxlint-disable-next-line react/only-export-components
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // LocalStorage-backed state with initial mockData fallback
  const [caseData, setCaseData] = useState(() => {
    try {
      const saved = localStorage.getItem('aasra_case');
      return saved ? JSON.parse(saved) : initialCaseInfo;
    } catch {
      return initialCaseInfo;
    }
  });

  const [assetList, setAssetList] = useState(() => {
    try {
      const saved = localStorage.getItem('aasra_assets');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with initial assets, avoiding duplicate IDs
        const existingIds = new Set(parsed.map((a) => a.id));
        const merged = [...parsed];
        initialAssets.forEach((a) => {
          if (!existingIds.has(a.id)) {
            merged.push(a);
          }
        });
        return merged;
      }
      return initialAssets;
    } catch {
      return initialAssets;
    }
  });

  const [actionList, setActionList] = useState(() => {
    try {
      const saved = localStorage.getItem('aasra_actions');
      return saved ? JSON.parse(saved) : initialActions;
    } catch {
      return initialActions;
    }
  });

  const [documentList, setDocumentList] = useState(() => {
    try {
      const saved = localStorage.getItem('aasra_documents');
      return saved ? JSON.parse(saved) : initialDocuments;
    } catch {
      return initialDocuments;
    }
  });

  const [timelineList, setTimelineList] = useState(() => {
    try {
      const saved = localStorage.getItem('aasra_timeline');
      return saved ? JSON.parse(saved) : initialTimeline;
    } catch {
      return initialTimeline;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aasra_case', JSON.stringify(caseData));
    } catch {
      // storage unavailable
    }
  }, [caseData]);

  useEffect(() => {
    try {
      localStorage.setItem('aasra_assets', JSON.stringify(assetList));
    } catch {
      // storage unavailable
    }
  }, [assetList]);

  useEffect(() => {
    try {
      localStorage.setItem('aasra_actions', JSON.stringify(actionList));
    } catch {
      // storage unavailable
    }
  }, [actionList]);

  useEffect(() => {
    try {
      localStorage.setItem('aasra_documents', JSON.stringify(documentList));
    } catch {
      // storage unavailable
    }
  }, [documentList]);

  useEffect(() => {
    try {
      localStorage.setItem('aasra_timeline', JSON.stringify(timelineList));
    } catch {
      // storage unavailable
    }
  }, [timelineList]);

  // Case Profile Mutations
  const updateCaseData = (updatedFields) => {
    setCaseData((prev) => ({
      ...prev,
      ...updatedFields,
    }));
  };

  // Action Mutations
  const updateActionStatus = (id, newStatus) => {
    setActionList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const toggleActionStatus = (id) => {
    setActionList((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextStatus = item.status === 'completed' ? 'needs' : 'completed';
        return {
          ...item,
          status: nextStatus,
          completedAt: nextStatus === 'completed' ? new Date().toISOString() : null,
        };
      })
    );
  };

  // Asset Mutations
  const updateAssetStatus = (id, newStatus) => {
    setAssetList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const addAsset = (newAsset) => {
    const id = `asset-${Date.now()}`;
    setAssetList((prev) => [...prev, { ...newAsset, id }]);
  };

  // Document Mutations
  const updateDocumentStatus = (id, newStatus) => {
    setDocumentList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const addDocument = (newDoc) => {
    const id = `doc-${Date.now()}`;
    const date = new Date().toISOString().split('T')[0];
    setDocumentList((prev) => [
      ...prev,
      { ...newDoc, id, date, uploadDate: date, status: 'pending' },
    ]);
  };

  // Reset to original mock data
  const resetToDefaults = () => {
    try {
      localStorage.removeItem('aasra_case');
      localStorage.removeItem('aasra_assets');
      localStorage.removeItem('aasra_actions');
      localStorage.removeItem('aasra_documents');
      localStorage.removeItem('aasra_timeline');
    } catch {
      // ignore
    }
    setCaseData(initialCaseInfo);
    setAssetList(initialAssets);
    setActionList(initialActions);
    setDocumentList(initialDocuments);
    setTimelineList(initialTimeline);
  };

  // Derived Metrics
  const totalAssets = assetList
    .filter((a) => a.category !== 'Liability' && a.category !== 'Subscription')
    .reduce((sum, a) => sum + (Number(a.value) || 0), 0);

  const totalLiabilities = assetList
    .filter((a) => a.category === 'Liability')
    .reduce((sum, a) => sum + (Number(a.value) || 0), 0);

  const netEstateValue = totalAssets - totalLiabilities;

  const totalActionsCount = actionList.length;
  const completedActionsCount = actionList.filter((a) => a.status === 'completed').length;
  const pendingActionsCount = totalActionsCount - completedActionsCount;

  // Real action-based closure progress percentage
  const closureProgress =
    totalActionsCount > 0
      ? Math.round((completedActionsCount / totalActionsCount) * 100)
      : 0;

  // Recharts Pie Chart Data (Category breakdown)
  const categoryTotals = assetList
    .filter((a) => a.category !== 'Liability' && a.category !== 'Subscription')
    .reduce((acc, a) => {
      const cat = a.category || 'Other';
      acc[cat] = (acc[cat] || 0) + (Number(a.value) || 0);
      return acc;
    }, {});

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));

  const value = {
    // State
    caseData,
    assetList,
    actionList,
    documentList,
    timelineList,
    // Mutations
    updateCaseData,
    updateActionStatus,
    toggleActionStatus,
    updateAssetStatus,
    addAsset,
    updateDocumentStatus,
    addDocument,
    resetToDefaults,
    // Derived Metrics
    totalAssets,
    totalLiabilities,
    netEstateValue,
    totalActionsCount,
    completedActionsCount,
    pendingActionsCount,
    closureProgress,
    pieData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
