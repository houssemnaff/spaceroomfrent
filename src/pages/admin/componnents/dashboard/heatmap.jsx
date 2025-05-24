import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function HeatMap({ title, data = [], xLabels = [], yLabels = [] }) {
  // Vérification et initialisation des données
  const safeData = Array.isArray(data) ? data : [];
  const safeXLabels = Array.isArray(xLabels) ? xLabels : [];
  const safeYLabels = Array.isArray(yLabels) ? yLabels : [];
  
  // Calcul de la valeur maximale en prenant en compte les cas vides
  const flattenedData = safeData.flat();
  const maxValue = flattenedData.length > 0 ? Math.max(...flattenedData) : 1;
  
  const getColor = (value) => {
    const normalizedValue = maxValue > 0 ? value / maxValue : 0;
    const opacity = Math.max(0.1, Math.min(1, normalizedValue * 0.9 + 0.1));
    return `rgb(37, 99, 235, ${opacity})`;
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {/* En-tête avec les labels X */}
          <div className="flex">
            <div className="w-16"></div> {/* Espace vide pour les labels Y */}
            <div className="flex-1 flex justify-between">
              {safeXLabels.map((label, index) => (
                <div key={index} className="text-xs text-center font-medium text-muted-foreground w-10">
                  {label}
                </div>
              ))}
            </div>
          </div>
          
          {/* Corps de la heatmap */}
          {safeData.map((row, rowIndex) => (
            <div key={rowIndex} className="flex items-center">
              <div className="w-16 text-xs font-medium text-right pr-3 text-muted-foreground">
                {safeYLabels[rowIndex] || `Jour ${rowIndex + 1}`}
              </div>
              <div className="flex-1 flex justify-between">
                {Array.isArray(row) ? (
                  row.map((value, colIndex) => (
                    <TooltipProvider key={colIndex}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="w-10 h-10 m-0.5 rounded-sm cursor-pointer transition-colors"
                            style={{ 
                              backgroundColor: getColor(value),
                              minWidth: '2.5rem' // Garantit une taille minimale
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-semibold">
                            {safeXLabels[colIndex] || `Col ${colIndex + 1}`}, 
                            {safeYLabels[rowIndex] || `Ligne ${rowIndex + 1}`}
                          </p>
                          <p>Activité: {value}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))
                ) : (
                  // Fallback si la ligne n'est pas un tableau
                  <div className="w-10 h-10 m-0.5 rounded-sm bg-gray-100"></div>
                )}
              </div>
            </div>
          ))}
          
          {/* Légende */}
          <div className="flex justify-end mt-4">
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">Moins</div>
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((opacity) => (
                <div 
                  key={opacity}
                  className="h-3 w-3 rounded-sm" 
                  style={{ backgroundColor: `rgb(37, 99, 235, ${opacity})` }}
                />
              ))}
              <div className="text-xs text-muted-foreground">Plus</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}