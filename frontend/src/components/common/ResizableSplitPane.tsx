import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ResizableSplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  minLeftWidth?: number;     // in pixels (e.g. 300)
  minRightWidth?: number;    // in pixels (e.g. 450)
  defaultSplit?: number;     // in percentage (e.g. 42 for 42% left / 58% right)
  storageKey?: string;       // localStorage key for persisting user preference
  className?: string;
}

export const ResizableSplitPane: React.FC<ResizableSplitPaneProps> = ({
  left,
  right,
  minLeftWidth = 320,
  minRightWidth = 450,
  defaultSplit = 42,
  storageKey = 'arena_workspace_split',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [splitPercent, setSplitPercent] = useState<number>(() => {
    if (typeof window !== 'undefined' && storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 15 && parsed <= 85) {
          return parsed;
        }
      }
    }
    return defaultSplit;
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const rafIdRef = useRef<number | null>(null);

  // Helper to clamp percentage based on actual container pixel dimensions
  const clampPercentage = useCallback(
    (targetPercent: number, containerWidth: number): number => {
      if (containerWidth <= 0) return targetPercent;
      const minPercent = Math.max(15, (minLeftWidth / containerWidth) * 100);
      const maxPercent = Math.min(85, 100 - (minRightWidth / containerWidth) * 100);

      if (minPercent > maxPercent) {
        return 50;
      }
      return Math.min(Math.max(targetPercent, minPercent), maxPercent);
    },
    [minLeftWidth, minRightWidth]
  );

  // Handle drag move using requestAnimationFrame for smooth 60fps
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      if (containerWidth <= 0) return;

      const mouseX = e.clientX - containerRect.left;
      const rawPercent = (mouseX / containerWidth) * 100;
      const clamped = clampPercentage(rawPercent, containerWidth);

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        setSplitPercent(clamped);
      });
    },
    [clampPercentage]
  );

  // Stop dragging and save to localStorage
  const handlePointerUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    document.body.style.userSelect = '';
    document.body.style.cursor = '';

    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);

    // Persist final percentage to localStorage
    setSplitPercent((curr) => {
      if (storageKey) {
        localStorage.setItem(storageKey, curr.toFixed(2));
      }
      return curr;
    });
  }, [handlePointerMove, storageKey]);

  // Start dragging on divider pointerdown
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      setIsDragging(true);

      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [handlePointerMove, handlePointerUp]
  );

  // Double-click resets to default split
  const handleDoubleClick = useCallback(() => {
    setSplitPercent(defaultSplit);
    if (storageKey) {
      localStorage.setItem(storageKey, defaultSplit.toString());
    }
  }, [defaultSplit, storageKey]);

  // Keyboard accessibility: Left / Right arrows resize
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.getBoundingClientRect().width;
      const step = 2.5; // 2.5% step

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSplitPercent((prev) => {
          const next = clampPercentage(prev - step, containerWidth);
          if (storageKey) localStorage.setItem(storageKey, next.toFixed(2));
          return next;
        });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSplitPercent((prev) => {
          const next = clampPercentage(prev + step, containerWidth);
          if (storageKey) localStorage.setItem(storageKey, next.toFixed(2));
          return next;
        });
      } else if (e.key === 'Home') {
        e.preventDefault();
        const minVal = (minLeftWidth / containerWidth) * 100;
        setSplitPercent(minVal);
      } else if (e.key === 'End') {
        e.preventDefault();
        const maxVal = 100 - (minRightWidth / containerWidth) * 100;
        setSplitPercent(maxVal);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleDoubleClick();
      }
    },
    [clampPercentage, handleDoubleClick, minLeftWidth, minRightWidth, storageKey]
  );

  // Window resize handler: ensure split stays valid within current window width
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.getBoundingClientRect().width;
      if (width > 0) {
        setSplitPercent((prev) => clampPercentage(prev, width));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [clampPercentage]);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col lg:flex-row w-full h-full overflow-hidden bg-[#080c14] ${className}`}
    >
      {/* Invisible dragging overlay prevents iframe / Monaco editor event capture during drag */}
      {isDragging && (
        <div className="fixed inset-0 z-50 cursor-col-resize select-none bg-transparent" />
      )}

      {/* Desktop Left Panel (Problem Context) */}
      <div
        className="hidden lg:flex flex-col h-full min-w-0 overflow-hidden"
        style={{ width: `${splitPercent}%`, flexShrink: 0 }}
      >
        {left}
      </div>

      {/* Draggable Vertical Divider (Desktop only) */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={Math.round(splitPercent)}
        aria-valuemin={15}
        aria-valuemax={85}
        aria-label="Resize Problem and Editor Panels"
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        className="hidden lg:flex relative items-center justify-center w-2 -mx-1 z-30 cursor-col-resize group select-none outline-none focus-visible:ring-1 focus-visible:ring-sky-500"
        title="Drag to resize panel | Double-click to reset"
      >
        {/* Expanded invisible hitbox (14px) for easy grabbing */}
        <div className="absolute inset-y-0 -left-1 -right-1 z-10 cursor-col-resize" />

        {/* Visible Divider Line (2px) */}
        <div
          className={`w-[2px] h-full transition-colors duration-150 rounded-full ${
            isDragging
              ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]'
              : 'bg-[#1b2436] group-hover:bg-slate-500'
          }`}
        />

        {/* Subtle Grip Handle indicator in center */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-0.5 w-3.5 h-6 rounded-full border border-[#1b2436] transition-all duration-150 z-20 ${
            isDragging
              ? 'bg-sky-500 border-sky-400 opacity-100 scale-110 shadow-sm'
              : 'bg-[#0d131f] group-hover:bg-slate-700 group-hover:border-slate-500 opacity-70 group-hover:opacity-100'
          }`}
        >
          <div className={`w-0.5 h-0.5 rounded-full ${isDragging ? 'bg-white' : 'bg-slate-400'}`} />
          <div className={`w-0.5 h-0.5 rounded-full ${isDragging ? 'bg-white' : 'bg-slate-400'}`} />
          <div className={`w-0.5 h-0.5 rounded-full ${isDragging ? 'bg-white' : 'bg-slate-400'}`} />
        </div>
      </div>

      {/* Desktop Right Panel (Code Editor & Diagnostics) */}
      <div
        className="hidden lg:flex flex-col h-full min-w-0 overflow-hidden flex-1"
        style={{ width: `${100 - splitPercent}%`, flexShrink: 0 }}
      >
        {right}
      </div>

      {/* Mobile / Tablet Stacked View */}
      <div className="flex lg:hidden flex-col w-full gap-2.5 overflow-y-auto">
        <div className="w-full">{left}</div>
        <div className="w-full">{right}</div>
      </div>
    </div>
  );
};
