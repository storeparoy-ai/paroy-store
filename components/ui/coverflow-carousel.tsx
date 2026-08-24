"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export interface CoverflowSlide {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  price?: string;
  originalPrice?: string;
  ctaText?: string;
  href?: string;
  meta?: { label: string; value: string }[];
}

export interface CoverflowCarouselProps {
  slides: CoverflowSlide[];
  rotate?: number;
  depth?: number;
  perspective?: number;
  falloff?: number;
  fade?: number;
  cardWidth?: string;
  gap?: number;
  loop?: boolean;
  showCaption?: boolean;
  showPagination?: boolean;
  showNavigation?: boolean;
  label?: string;
  className?: string;
  cardClassName?: string;
  renderCustomCard?: (slide: CoverflowSlide, index: number, isSelected: boolean) => React.ReactNode;
}

export function CoverflowCarousel({
  slides,
  rotate = 38,
  depth = 0.55,
  perspective = 2.8,
  falloff = 0.6,
  fade = 0.12,
  cardWidth = "clamp(240px, 28vw, 340px)",
  gap = 0.08,
  loop = true,
  showCaption = false,
  showPagination = false,
  showNavigation = true,
  label = "3D Coverflow Carousel",
  className,
  cardClassName,
  renderCustomCard,
}: CoverflowCarouselProps) {
  const count = slides.length;

  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const posRef = React.useRef(0);
  const targetRef = React.useRef(0);
  const widthRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const dragRef = React.useRef<{
    id: number;
    x: number;
    pos: number;
    v: number;
    t: number;
  } | null>(null);

  const [selected, setSelected] = React.useState(0);

  const indexAt = React.useCallback(
    (pos: number) => ((Math.round(pos) % count) + count) % count,
    [count],
  );

  const paint = React.useCallback(() => {
    const width = widthRef.current;
    if (!width) return;
    const pitch = width * (1 + gap);
    const pos = posRef.current;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      let offset = index - pos;
      if (loop) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }

      const distance = Math.abs(offset);
      const ramp = Math.pow(distance, falloff);
      const tilt = Math.min(rotate * ramp, 80) * Math.sign(offset);

      card.style.transform =
        `translateX(calc(-50% + ${offset * pitch}px)) ` +
        `translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`;

      const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
      card.style.opacity = String(Math.max(0.2, 1 - fade * distance) * edge);
      card.style.zIndex = String(100 - Math.round(distance));
      
      // Dynamic glowing border on center active card
      if (distance < 0.45) {
        card.style.filter = "drop-shadow(0 0 25px rgba(0, 240, 255, 0.45))";
      } else {
        card.style.filter = "none";
      }
    });
  }, [count, depth, fade, falloff, gap, loop, rotate]);

  const settle = React.useCallback(
    (target: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      targetRef.current = target;
      setSelected(indexAt(target));

      const step = () => {
        const remaining = target - posRef.current;
        if (Math.abs(remaining) < 0.0004) {
          posRef.current = target;
          paint();
          rafRef.current = null;
          return;
        }
        posRef.current += remaining * 0.16;
        paint();
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [indexAt, paint],
  );

  const clamp = React.useCallback(
    (pos: number) => (loop ? pos : Math.max(0, Math.min(count - 1, pos))),
    [count, loop],
  );

  const goTo = React.useCallback(
    (index: number) => {
      const target = loop
        ? index + Math.round((targetRef.current - index) / count) * count
        : index;
      settle(clamp(target));
    },
    [clamp, count, loop, settle],
  );

  const nudge = React.useCallback(
    (by: number) => settle(clamp(Math.round(targetRef.current) + by)),
    [clamp, settle],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = posRef.current;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      pos: posRef.current,
      v: 0,
      t: performance.now(),
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;

    const now = performance.now();
    const previous = posRef.current;
    posRef.current = clamp(drag.pos - (event.clientX - drag.x) / pitch);
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;

    const index = indexAt(posRef.current);
    if (index !== selected) setSelected(index);
    paint();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    const carried = Math.max(-2, Math.min(2, drag.v * 0.18));
    settle(clamp(Math.round(posRef.current + carried)));
  };

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () => {
      const card = cardRefs.current[0];
      if (!card) return;
      widthRef.current = card.offsetWidth;
      paint();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [paint]);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const active = slides[selected];

  return (
    <div
      className={cn("w-full relative select-none", className)}
      style={{ ["--cf-card" as string]: cardWidth }}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="relative">
        <div
          ref={frameRef}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              nudge(-1);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              nudge(1);
            }
          }}
          className="cursor-grab overflow-hidden py-8 sm:py-10 outline-none active:cursor-grabbing"
          style={{
            perspective: `calc(var(--cf-card) * ${perspective})`,
            touchAction: "pan-y",
          }}
        >
          <div
            className="relative"
            style={{
              height: "calc(var(--cf-card) * 1.52)",
              transformStyle: "preserve-3d",
            }}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                onClick={() => goTo(index)}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${count}`}
                className={cn(
                  "absolute left-1/2 top-0 overflow-hidden rounded-3xl bg-bg-card border border-white/10 shadow-2xl will-change-transform cursor-pointer transition-colors duration-200",
                  index === selected ? "border-brand-cyan/60" : "hover:border-white/20",
                  cardClassName,
                )}
                style={{
                  width: "var(--cf-card)",
                  height: "calc(var(--cf-card) * 1.52)",
                }}
              >
                {renderCustomCard ? (
                  renderCustomCard(slide, index, index === selected)
                ) : (
                  <div className="relative w-full h-full flex flex-col justify-between p-4 overflow-hidden">
                    {/* Background Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.src}
                      alt={slide.alt}
                      draggable={false}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-bg-deep via-bg-deep/40 to-transparent" />

                    {/* Top Badge */}
                    <div className="relative z-10 flex justify-between items-center">
                      {slide.badge ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 backdrop-blur-md">
                          {slide.badge}
                        </span>
                      ) : <span />}
                    </div>

                    {/* Bottom Info */}
                    <div className="relative z-10 space-y-1">
                      {slide.subtitle && (
                        <p className="text-[11px] font-bold text-brand-cyan uppercase tracking-wider">
                          {slide.subtitle}
                        </p>
                      )}
                      <h4 className="font-heading font-black text-sm sm:text-base text-white tracking-tight leading-snug">
                        {slide.title}
                      </h4>
                      {slide.price && (
                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="text-sm font-black text-primary-container">
                            {slide.price}
                          </span>
                          {slide.originalPrice && (
                            <span className="text-[11px] text-text-dim line-through">
                              {slide.originalPrice}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {showNavigation && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={(e) => {
                e.stopPropagation();
                nudge(-1);
              }}
              className="absolute left-2 sm:left-4 top-1/2 z-30 -translate-y-1/2 rounded-2xl bg-bg-deep/80 p-2.5 sm:p-3 text-white border border-white/15 backdrop-blur-xl shadow-xl transition-all hover:bg-brand-cyan hover:text-black hover:border-brand-cyan cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={(e) => {
                e.stopPropagation();
                nudge(1);
              }}
              className="absolute right-2 sm:right-4 top-1/2 z-30 -translate-y-1/2 rounded-2xl bg-bg-deep/80 p-2.5 sm:p-3 text-white border border-white/15 backdrop-blur-xl shadow-xl transition-all hover:bg-brand-cyan hover:text-black hover:border-brand-cyan cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Caption & Quick CTA for Active Item */}
      {showCaption && active && (
        <div className="mt-2 flex flex-col items-center text-center px-4 animate-fade-in">
          <p className="text-base sm:text-lg font-heading font-black text-white">
            {active.title}
          </p>
          {active.subtitle && (
            <p className="text-xs text-text-muted mt-0.5">
              {active.subtitle}
            </p>
          )}
          {active.href && (
            <a
              href={active.href}
              className="mt-3.5 btn-cyber text-xs py-2 px-6 shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            >
              {active.ctaText || "Lihat Detail →"}
            </a>
          )}
        </div>
      )}

      {/* Pagination Dots */}
      {showPagination && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => goTo(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                index === selected
                  ? "w-7 bg-brand-cyan shadow-[0_0_10px_#00f0ff]"
                  : "w-2 bg-white/20 hover:bg-white/40",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
