"use client";

import React from 'react';
import { CaseInformation, CaseData } from './CaseInformation';
import { IncidentLocation } from './IncidentLocation';
import { ImportantDates } from './ImportantDates';
import { CaseDescription } from './CaseDescription';

interface CaseDetailTabProps {
  caseData: CaseData;
}

export function CaseDetailTab({ caseData }: CaseDetailTabProps) {
  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:grid-rows-2 lg:gap-4 lg:h-[650px]">
      <CaseInformation caseData={caseData} />
      <IncidentLocation caseData={caseData} />
      <ImportantDates caseData={caseData} />
      <CaseDescription caseData={caseData} />
    </div>
  );
} 