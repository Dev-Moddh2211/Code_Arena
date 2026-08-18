import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface ResizableSplitPaneProps {
  direction?: 'horizontal' | 'vertical';
  // Panel contents (supports left/right for horizontal, top/bottom or first/second for both)
  first?: React.ReactNode;
  second?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  top?: React.ReactNode;
  bottom?: React.ReactNode;
  minFirstSize?: number;     // Min pixels for left (horizontal) or top (vertical)
  minSecondSize?: number;    // Min pixels for right (horizontal) or bottom (vertical)
  minLeftWidth?: number;     // Alias for minFirstSize
  minRightWidth?: number;    // Alias for minSecondSize
  defaultSplit?: number;     // Percentage (e.g. 42 for horizontal, 60 for vertical)
  storageKey?: string;       // localStorage key for persisting user preference
  className?: string;
}

export const ResizableSplitPane: React.FC<ResizableSplitPaneProps> = ({
  direction = 'horizontal',
  first,
  second,
  left,
  right,
  top,
  bottom,
  minFirstSize,
  minSecondSize,
  minLeftWidth,
  minRightWidth,
  defaultSplit,
  storageKey,
  className = '',
}) => {
  const isHorizontal = direction === 'horizontal';

  // Resolve panels
  const panelFirst = first ?? (isHorizontal ? left : top);
  const panelSecond = second ?? (isHorizontal ? right : bottom);

  // Resolve minimum sizes
  const minSizeA = minFirstSize ?? minLeftWidth ?? (isHorizontal ? 320 : 180);
  const minSizeB = minSecondSize ?? minRightWidth ?? (isHorizontal ? 450 : 140);

  // Resolve default split percentage
  const defaultPercentage = defaultSplit ?? (isHorizontal ? 42 : 58);
  const effectiveStorageKey = storageKey ?? (isHorizontal ? 'arena_workspace_split' : 'arena_editor_split');

  const containerRef = useRef<HTMLDivElement>(null);
  const [splitPercent, setSplitPercent] = useState<number>(() => {
    if (typeof window !== 'undefined' && effectiveStorageKey) {
      const saved = localStorage.getItem(effectiveStorageKey);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 10 && parsed <= 90) {
          return parsed;
        }
      }
    }
    return defaultPercentage;
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const rafIdRef = useRef<number | null>(null);

  // Helper to clamp percentage based on actual container dimensions
  const clampPercentage = useCallback(
    (targetPercent: number, containerDim: number): number => {
      if (containerDim <= 0) return targetPercent;
      const minPercent = Math.max(10, (minSizeA / containerDim) * 100);
      const maxPercent = Math.min(90, 100 - (minSizeB / containerDim) * 100);

      if (minPercent > maxPercent) {
        return 50;
      }
      return Math.min(Math.max(targetPercent, minPercent), maxPercent);
    },
    [minSizeA, minSizeB]
  );

  // Handle drag move using requestAnimationFrame for smooth 60fps
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerDim = isHorizontal ? containerRect.width : containerRect.height;
      if (containerDim <= 0) return;

      const mousePos = isHorizontal ? e.clientX - containerRect.left : e.clientY - containerRect.top;
      const rawPercent = (mousePos / containerDim) * 100;
      const clamped = clampPercentage(rawPercent, containerDim);

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        setSplitPercent(clamped);
      });
    },
    [clampPercentage, isHorizontal]
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
      if (effectiveStorageKey) {
        localStorage.setItem(effectiveStorageKey, curr.toFixed(2));
      }
      return curr;
    });
  }, [handlePointerMove, effectiveStorageKey]);

  // Start dragging on divider pointerdown
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      setIsDragging(true);

      document.body.style.userSelect = 'none';
      document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize';

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [handlePointerMove, handlePointerUp, isHorizontal]
  );

  // Double-click resets to default split
  const handleDoubleClick = useCallback(() => {
    setSplitPercent(defaultPercentage);
    if (effectiveStorageKey) {
      localStorage.setItem(effectiveStorageKey, defaultPercentage.toString());
    }
  }, [defaultPercentage, effectiveStorageKey]);

  // Keyboard accessibility
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerDim = isHorizontal ? containerRect.width : containerRect.height;
      const step = 2.5;

      if ((isHorizontal && e.key === 'ArrowLeft') || (!isHorizontal && e.key === 'ArrowUp')) {
        e.preventDefault();
        setSplitPercent((prev) => {
          const next = clampPercentage(prev - step, containerDim);
          if (effectiveStorageKey) localStorage.setItem(effectiveStorageKey, next.toFixed(2));
          return next;
        });
      } else if ((isHorizontal && e.key === 'ArrowRight') || (!isHorizontal && e.key === 'ArrowDown')) {
        e.preventDefault();
        setSplitPercent((prev) => {
          const next = clampPercentage(prev + step, containerDim);
          if (effectiveStorageKey) localStorage.setItem(effectiveStorageKey, next.toFixed(2));
          return next;
        });
      } else if (e.key === 'Home') {
        e.preventDefault();
        const minVal = (minSizeA / containerDim) * 100;
        setSplitPercent(minVal);
      } else if (e.key === 'End') {
        e.preventDefault();
        const maxVal = 100 - (minSizeB / containerDim) * 100;
        setSplitPercent(maxVal);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleDoubleClick();
      }
    },
    [clampPercentage, handleDoubleClick, isHorizontal, minSizeA, minSizeB, effectiveStorageKey]
  );

  // Window resize handler: ensure split stays valid within current container dimension
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerDim = isHorizontal ? containerRect.width : containerRect.height;
      if (containerDim > 0) {
        setSplitPercent((prev) => clampPercentage(prev, containerDim));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [clampPercentage, isHorizontal]);

  if (isHorizontal) {
    // ── Horizontal Split (Left / Right) ──
    return (
      <div
        ref={containerRef}
        className={`relative flex flex-col lg:flex-row w-full h-full overflow-hidden bg-[#080c14] ${className}`}
      >
        {/* Invisible dragging overlay */}
        {isDragging && (
          <div className="fixed inset-0 z-50 cursor-col-resize select-none bg-transparent" />
        )}

        {/* Desktop Left Panel */}
        <div
          className="hidden lg:flex flex-col h-full min-w-0 overflow-hidden"
          style={{ width: `${splitPercent}%`, flexShrink: 0 }}
        >
          {panelFirst}
        </div>

        {/* Draggable Vertical Divider */}
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
          {/* Expanded 14px invisible hitbox */}
          <div className="absolute inset-y-0 -left-1.5 -right-1.5 z-10 cursor-col-resize" />

          {/* Visible Divider Line (2px) */}
          <div
            className={`w-[2px] h-full transition-colors duration-150 rounded-full ${
              isDragging
                ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]'
                : 'bg-[#1b2436] group-hover:bg-slate-500'
            }`}
          />

          {/* Subtle Grip Handle indicator */}
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

        {/* Desktop Right Panel */}
        <div
          className="hidden lg:flex flex-col h-full min-w-0 overflow-hidden flex-1"
          style={{ width: `${100 - splitPercent}%`, flexShrink: 0 }}
        >
          {panelSecond}
        </div>

        {/* Mobile / Tablet Stacked View */}
        <div className="flex lg:hidden flex-col w-full gap-2.5 overflow-y-auto">
          <div className="w-full">{panelFirst}</div>
          <div className="w-full">{panelSecond}</div>
        </div>
      </div>
    );
  }

  // ── Vertical Split (Top / Bottom) ──
  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col w-full h-full min-h-0 overflow-hidden ${className}`}
    >
      {/* Invisible dragging overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 cursor-row-resize select-none bg-transparent" />
      )}

      {/* Top Panel (Code Editor) */}
      <div
        className="flex flex-col w-full min-h-0 overflow-hidden"
        style={{ height: `${splitPercent}%`, flexShrink: 0 }}
      >
        {panelFirst}
      </div>

      {/* Draggable Horizontal Divider */}
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-valuenow={Math.round(splitPercent)}
        aria-valuemin={15}
        aria-valuemax={85}
        aria-label="Resize Editor and Diagnostics Panels"
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        className="relative flex items-center justify-center h-2 -my-0.5 w-full z-30 cursor-row-resize group select-none outline-none focus-visible:ring-1 focus-visible:ring-sky-500"
        title="Drag to resize panel | Double-click to reset"
      >
        {/* Expanded 14px invisible hitbox */}
        <div className="absolute inset-x-0 -top-1.5 -bottom-1.5 z-10 cursor-row-resize" />

        {/* Visible Divider Line (2px) */}
        <div
          className={`h-[2px] w-full transition-colors duration-150 rounded-full ${
            isDragging
              ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]'
              : 'bg-[#1b2436] group-hover:bg-slate-500'
          }`}
        />

        {/* Subtle Horizontal Grip Handle indicator */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 flex items-center justify-center gap-0.5 h-3.5 w-6 rounded-full border border-[#1b2436] transition-all duration-150 z-20 ${
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

      {/* Bottom Panel (Test Cases / Console) */}
      <div
        className="flex flex-col w-full min-h-0 overflow-hidden flex-1"
        style={{ height: `${100 - splitPercent}%`, flexShrink: 0 }}
      >
        {panelSecond}
      </div>
    </div>
  );
};
