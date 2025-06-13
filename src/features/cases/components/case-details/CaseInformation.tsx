"use client";

import React from 'react';
import { BoxCubeIcon, UserIcon } from '@/assets/icons';
import Badge from '@/components/ui/badge/Badge';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../constants';

export interface CaseData {
  id: string;
  name: string;
  clientId: string | null;
  type: string;
  subType: string;
  division: string;
  owner: string;
  description: string | null;
  incidentDate: string | null;
  caseAddedDate: string;
  lastUpdatedDate: string;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  gpsCoordinates: string | null | {
    type: string;
    coordinates: number[];
    crs?: any;
  };
  caseStatus: 'Open' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

interface CaseInformationProps {
  caseData: CaseData;
}

export function CaseInformation({ caseData }: CaseInformationProps) {
  return (
    <div className="w-full lg:col-span-2 bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-500/10 dark:to-blue-500/10 rounded-2xl p-5 sm:p-6 border border-brand-100 dark:border-brand-500/20">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <BoxCubeIcon className="h-5.5 w-5.5 text-brand-500" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{caseData.name}</h3>
            <p className="text-base text-gray-600 dark:text-gray-400">Case #{caseData.clientId || 'N/A'}</p>
          </div>
        </div>
        <div>
          <Badge
            size="md"
            color={STATUS_COLORS[caseData.caseStatus as keyof typeof STATUS_COLORS]}
          >
            {caseData.caseStatus}
          </Badge>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        {/* First Row - 3 Features */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Client ID</label>
            <p className="text-base font-medium text-gray-900 dark:text-white mt-1.5">{caseData.clientId || 'Not specified'}</p>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Case Type</label>
            <p className="text-base font-medium text-gray-900 dark:text-white mt-1.5">{caseData.type}</p>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Division</label>
            <p className="text-base font-medium text-gray-900 dark:text-white mt-1.5">{caseData.division}</p>
          </div>
        </div>
        
        {/* Second Row - 3 Features */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Sub Type</label>
            <p className="text-base font-medium text-gray-900 dark:text-white mt-1.5">{caseData.subType}</p>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Priority Level</label>
            <div className="mt-1.5">
              <Badge
                size="sm"
                color={PRIORITY_COLORS[caseData.priority as keyof typeof PRIORITY_COLORS]}
                variant={caseData.priority === 'Critical' ? 'solid' : 'light'}
              >
                {caseData.priority}
              </Badge>
            </div>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Case Owner</label>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="p-1 bg-blue-100 dark:bg-blue-500/20 rounded">
                <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-base font-medium text-gray-900 dark:text-white">{caseData.owner}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 