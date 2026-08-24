'use client';

import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import React, { useState } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const CONSTANTS = {
  itemSize: 50,
  radius: 140, // distance from trigger button
  openStagger: 0.03,
  closeStagger: 0.04
};

// Fan out smoothly in a 105-degree upward-left arc into the viewport (never goes off-screen!)
const pointOnArc = (index: number, total: number, r: number) => {
  const startAngle = Math.PI * 0.95; // ~171 deg (Left)
  const endAngle = Math.PI * 1.55;   // ~279 deg (Up)
  const theta = total === 1 ? startAngle : startAngle + ((endAngle - startAngle) * index) / (total - 1);
  const x = r * Math.cos(theta);
  const y = r * Math.sin(theta);
  return { x, y };
};

export interface CircleMenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  color?: string;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  color?: string;
  index: number;
  totalItems: number;
  isOpen: boolean;
  onItemClick?: () => void;
}

const MenuItem = ({ icon, label, href, color = '#00f0ff', index, totalItems, isOpen, onItemClick }: MenuItemProps) => {
  const { x, y } = pointOnArc(index, totalItems, CONSTANTS.radius);
  const [hovering, setHovering] = useState(false);

  return (
    <Link
      href={href}
      onClick={onItemClick}
      className="absolute flex items-center justify-center pointer-events-auto"
    >
      <motion.div
        animate={{
          x: isOpen ? x : 0,
          y: isOpen ? y : 0,
          scale: isOpen ? 1 : 0,
          opacity: isOpen ? 1 : 0
        }}
        whileHover={{
          scale: 1.15,
          transition: { duration: 0.15 }
        }}
        transition={{
          delay: isOpen ? index * CONSTANTS.openStagger : (totalItems - index) * CONSTANTS.closeStagger,
          type: 'spring',
          stiffness: 380,
          damping: 24
        }}
        style={{
          height: CONSTANTS.itemSize,
          width: CONSTANTS.itemSize,
        }}
        className="relative rounded-2xl bg-[#0e1422] border border-white/12 text-white flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.8)] hover:border-brand-cyan hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all cursor-pointer group"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className="text-white group-hover:text-brand-cyan transition-colors">
          {icon}
        </div>

        {/* Hover Tooltip Pill */}
        {hovering && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-xl bg-bg-deep border border-brand-cyan/40 text-[10px] font-black uppercase tracking-wider text-brand-cyan whitespace-nowrap shadow-[0_4px_16px_rgba(0,240,255,0.3)] pointer-events-none z-50"
          >
            {label}
          </motion.div>
        )}
      </motion.div>
    </Link>
  );
};

interface MenuTriggerProps {
  setIsOpen: (isOpen: boolean) => void;
  isOpen: boolean;
  closeAnimationCallback: () => void;
}

const MenuTrigger = ({
  setIsOpen,
  isOpen,
  closeAnimationCallback,
}: MenuTriggerProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      style={{
        height: CONSTANTS.itemSize + 6,
        width: CONSTANTS.itemSize + 6
      }}
      className={cn(
        'rounded-2xl flex items-center justify-center cursor-pointer outline-none ring-0 transition-all duration-300 z-50 shadow-[0_8px_32px_rgba(0,240,255,0.35)]',
        isOpen
          ? 'bg-red-500 text-white border border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.6)] rotate-90'
          : 'bg-linear-to-tr from-brand-cyan to-primary-container text-black font-black border border-brand-cyan/50 hover:shadow-[0_0_30px_rgba(0,240,255,0.8)]'
      )}
      onClick={() => {
        if (isOpen) {
          setIsOpen(false);
          closeAnimationCallback();
        } else {
          setIsOpen(true);
        }
      }}
      aria-label="Quick Hub Menu"
    >
      <AnimatePresence mode="popLayout">
        {isOpen ? (
          <motion.div
            key="menu-close"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <X size={22} className="text-white" />
          </motion.div>
        ) : (
          <motion.div
            key="menu-open"
            initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <Menu size={22} className="text-black" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export function CircleMenu({
  items,
}: {
  items: CircleMenuItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const animate = useAnimationControls();

  const closeAnimationCallback = async () => {
    await animate.start({
      rotate: -180,
      transition: { duration: 0.22, ease: 'easeInOut' }
    });
    await animate.start({
      rotate: 0,
      transition: { duration: 0 }
    });
  };

  return (
    <div className="relative flex items-center justify-center pointer-events-none">
      {/* Background Overlay when Open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs pointer-events-auto z-40"
          />
        )}
      </AnimatePresence>

      <div className="relative z-50 pointer-events-auto">
        <MenuTrigger
          setIsOpen={setIsOpen}
          isOpen={isOpen}
          closeAnimationCallback={closeAnimationCallback}
        />

        {items.map((item, index) => (
          <MenuItem
            key={item.href}
            index={index}
            totalItems={items.length}
            isOpen={isOpen}
            onItemClick={() => setIsOpen(false)}
            {...item}
          />
        ))}
      </div>
    </div>
  );
}
