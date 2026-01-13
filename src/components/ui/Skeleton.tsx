'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[#1A1A1A]',
        className
      )}
    />
  );
}

export function GameCardSkeleton() {
  return (
    <div className="rounded-2xl bg-[#161616] border border-[#2A2A2A] overflow-hidden">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="p-3">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function GameCardCompactSkeleton() {
  return (
    <div className="w-[140px] rounded-xl bg-[#161616] border border-[#2A2A2A] overflow-hidden flex-shrink-0">
      <Skeleton className="aspect-[3/4] rounded-none" />
    </div>
  );
}

export function HeroCardSkeleton() {
  return (
    <div className="rounded-2xl bg-[#161616] border border-[#2A2A2A] p-6 overflow-hidden">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#0A0A0A]">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

export function BalanceCardSkeleton() {
  return (
    <div className="rounded-xl bg-[#161616] border border-[#2A2A2A] p-4">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

export function TransactionSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0A0A0A]">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="flex-1">
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-5 w-16" />
    </div>
  );
}

export function GamesPageSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
      {/* Search skeleton */}
      <div className="px-4 pt-4 pb-2">
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>

      {/* Category pills skeleton */}
      <div className="px-4 py-3 flex gap-2 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-full flex-shrink-0" />
        ))}
      </div>

      {/* Hero card skeleton */}
      <div className="px-4 mb-6">
        <HeroCardSkeleton />
      </div>

      {/* Horizontal scroll skeleton */}
      <div className="px-4 mb-6">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="flex gap-3 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <GameCardCompactSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Game grid skeleton */}
      <div className="px-4 mb-6">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] px-4 pt-6">
      {/* Avatar and name */}
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>

      {/* Menu items */}
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
