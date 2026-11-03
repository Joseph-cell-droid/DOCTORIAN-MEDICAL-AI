import React from 'react';

const createTagComponent = (tag: string) => {
  const Comp = React.forwardRef(({ 
    initial, 
    animate, 
    exit, 
    transition, 
    variants, 
    whileHover, 
    whileTap, 
    whileFocus,
    whileDrag,
    onAnimationStart,
    onAnimationComplete,
    layout,
    layoutId,
    drag,
    dragConstraints,
    ...props 
  }: any, ref: any) => {
    return React.createElement(tag, { ref, ...props });
  });
  Comp.displayName = `Motion${tag}`;
  return Comp;
};

const motionCache = new Map<string, any>();

export const motion: any = new Proxy({}, {
  get(_, tag: string) {
    if (!motionCache.has(tag)) {
      motionCache.set(tag, createTagComponent(tag));
    }
    return motionCache.get(tag);
  }
});

export const AnimatePresence: React.FC<{ children?: React.ReactNode; mode?: string; initial?: boolean }> = ({ children }) => {
  return <>{children}</>;
};

export const useAnimation = () => ({
  start: async () => {},
  stop: () => {},
  set: () => {}
});

export const useMotionValue = (initial: any) => ({
  get: () => initial,
  set: () => {},
  onChange: () => () => {},
  on: () => () => {}
});

export const useTransform = () => ({
  get: () => 0,
  onChange: () => () => {},
  on: () => () => {}
});

export const useScroll = () => ({
  scrollY: { get: () => 0, onChange: () => () => {}, on: () => () => {} },
  scrollYProgress: { get: () => 0, onChange: () => () => {}, on: () => () => {} }
});

export const useInView = () => true;
export const useSpring = (initial: any) => ({ get: () => initial, set: () => {} });

export type Variants = Record<string, any>;
export type MotionValue<T = any> = any;
export type AnimationControls = any;

export default {
  motion,
  AnimatePresence,
  useAnimation,
  useMotionValue,
  useTransform,
  useScroll,
  useInView,
  useSpring
};
