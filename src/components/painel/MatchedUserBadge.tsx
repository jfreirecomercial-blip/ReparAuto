'use client';

import { SealCheck } from '@phosphor-icons/react';

/**
 * Soft, public-only signal that a CRM client also has a RecarGarage account
 * (matched by email, server-side). No private data is exposed.
 */
export default function MatchedUserBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-700 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded-full"
      title="Este cliente também tem conta no RecarGarage."
    >
      <SealCheck weight="fill" /> No RecarGarage
    </span>
  );
}
