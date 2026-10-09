import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const AllergenWarning = ({ allergens = [], warningInfo }) => {
  const hasMatch = warningInfo?.hasMatch;
  const matchingAllergens = warningInfo?.matchingAllergens || [];

  return (
    <div className="space-y-3">
      {/* High Alert Match Banner */}
      {hasMatch && (
        <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4 flex items-start space-x-3 shadow-md animate-pulse">
          <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-900 uppercase tracking-wide">
              Allergen Match Alert!
            </h4>
            <p className="text-sm text-red-700 mt-1 font-medium">
              This meal appears to contain <strong className="uppercase underline">{matchingAllergens.join(', ')}</strong>, which match your profile allergen warnings.
            </p>
          </div>
        </div>
      )}

      {/* Detected Allergens Badges */}
      <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span className="text-sm font-bold text-amber-900">Detected Big 9 Allergens:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {allergens.length > 0 ? (
            allergens.map((allergen, idx) => {
              const isMatched = matchingAllergens.includes(allergen);
              return (
                <span
                  key={idx}
                  className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full border ${
                    isMatched
                      ? 'bg-red-600 text-white border-red-700 shadow-sm'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {allergen}
                </span>
              );
            })
          ) : (
            <span className="text-xs font-semibold text-emerald-700 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>No Big 9 Allergens Detected</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
