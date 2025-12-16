/**
 * Group Meetings Logo Component
 * Based on the design mockup with calendar and people icons
 */

"use client";

import { cn } from "@rallly/ui";

export interface GroupMeetingsLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const sizes = {
  sm: { container: "w-20 h-20", text: "text-[10px]" },
  md: { container: "w-32 h-32", text: "text-xs" },
  lg: { container: "w-40 h-40", text: "text-sm" },
};

export function GroupMeetingsLogo({
  className,
  size = "md",
  showText = true,
}: GroupMeetingsLogoProps) {
  const sizeConfig = sizes[size];
  
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full",
          "bg-gradient-to-br from-[#c7dbda] via-[#ffe5e9] to-[#fdd7c2]",
          "border-4 border-[#1e3a5f] shadow-lg",
          sizeConfig.container,
        )}
      >
        {/* Calendar Icon */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="relative">
            {/* Calendar Header with loops */}
            <div className="h-5 w-14 rounded-t-lg bg-[#1e3a5f] flex items-center justify-center relative">
              <div className="absolute -left-1 top-0 w-2 h-2 rounded-full border-2 border-[#1e3a5f] bg-[#c7dbda]"></div>
              <div className="absolute -right-1 top-0 w-2 h-2 rounded-full border-2 border-[#1e3a5f] bg-[#c7dbda]"></div>
            </div>
            {/* Calendar Body */}
            <div className="h-10 w-14 bg-white rounded-b-lg border-2 border-[#1e3a5f] flex items-center justify-center relative">
              <div className="text-[#1e3a5f] font-bold text-xs">C</div>
              {/* Clock icon in calendar */}
              <div className="absolute bottom-1 right-1">
                <div className="w-2.5 h-2.5 border border-[#1e3a5f] rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-[#1e3a5f] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* People Icons - arranged in semi-circle */}
        <div className="absolute bottom-3 flex items-end justify-center gap-0.5">
          {/* Person 1 - Blue */}
          <div className="flex flex-col items-center relative">
            <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] mb-0.5"></div>
            <div className="w-1.5 h-2.5 bg-[#3b82f6] rounded-b"></div>
          </div>
          {/* Person 2 - Blue with speech bubble */}
          <div className="flex flex-col items-center relative">
            <div className="w-2 h-2 rounded-full bg-[#2563eb] mb-0.5"></div>
            <div className="w-1.5 h-2 bg-[#2563eb] rounded-b"></div>
            <div className="absolute -top-1 left-0 w-1 h-1 rounded-full bg-[#2563eb]"></div>
          </div>
          {/* Person 3 - Green (raising hand) */}
          <div className="flex flex-col items-center relative">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] mb-0.5"></div>
            <div className="w-1.5 h-2.5 bg-[#10b981] rounded-b"></div>
            <div className="absolute -top-0.5 -right-0.5 w-1 h-1 rounded-full bg-[#10b981]"></div>
          </div>
          {/* Person 4 - Yellow */}
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#fbbf24] mb-0.5"></div>
            <div className="w-1.5 h-2.5 bg-[#fbbf24] rounded-b"></div>
          </div>
          {/* Person 5 - Red with speech bubble */}
          <div className="flex flex-col items-center relative">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] mb-0.5"></div>
            <div className="w-1.5 h-2.5 bg-[#ef4444] rounded-b"></div>
            <div className="absolute -top-1 right-0 w-1 h-1 rounded-full bg-[#ef4444]"></div>
          </div>
        </div>
      </div>

      {/* Text "GROUP MEETINGS" */}
      {showText && (
        <div className={cn("mt-2 whitespace-nowrap", sizeConfig.text)}>
          <span className="text-[#1e3a5f] font-bold tracking-wider">
            GROUP MEETINGS
          </span>
        </div>
      )}
    </div>
  );
}

