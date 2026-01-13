'use client';

import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardPlayer {
  rank: number;
  username: string;
  avatar?: string;
  wagered?: number;
  prize?: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  players: LeaderboardPlayer[];
  title?: string;
  className?: string;
}

export function Leaderboard({ players, title = 'Leaderboard', className }: LeaderboardProps) {
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#FFD700] to-[#D4AF37] text-black text-xs font-bold">
            <Trophy className="w-3 h-3" />
            Rank 1
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#C0C0C0] to-[#A8A8A8] text-black text-xs font-bold">
            <Medal className="w-3 h-3" />
            Rank 2
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#CD7F32] to-[#B87333] text-black text-xs font-bold">
            <Medal className="w-3 h-3" />
            Rank 3
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2A2A2A] text-[#A3A3A3] text-xs font-semibold">
            <Trophy className="w-3 h-3" />
            Rank {rank}
          </span>
        );
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white font-display">{title}</h3>
        <button className="text-[#D4AF37] text-sm font-medium hover:underline">
          View All
        </button>
      </div>

      {/* Players List */}
      <div className="space-y-2">
        {players.map((player, index) => (
          <motion.div
            key={player.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl border transition-all duration-200',
              player.rank <= 3
                ? 'bg-gradient-to-r from-[#D4AF37]/10 to-transparent border-[#D4AF37]/30'
                : 'bg-[#161616] border-[#2A2A2A] hover:border-[#D4AF37]/20',
              player.isCurrentUser && 'ring-2 ring-[#D4AF37]/50'
            )}
          >
            {/* Rank Number */}
            <div className="w-8 text-center">
              <span
                className={cn(
                  'text-lg font-bold',
                  player.rank === 1 && 'text-[#FFD700]',
                  player.rank === 2 && 'text-[#C0C0C0]',
                  player.rank === 3 && 'text-[#CD7F32]',
                  player.rank > 3 && 'text-[#666666]'
                )}
              >
                {player.rank}
              </span>
            </div>

            {/* Avatar */}
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                'bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A]',
                player.rank <= 3 && 'ring-2 ring-[#D4AF37]/50'
              )}
            >
              {player.avatar ? (
                <img
                  src={player.avatar}
                  alt={player.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-lg">👤</span>
              )}
            </div>

            {/* Username */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'font-medium truncate',
                  player.isCurrentUser ? 'text-[#D4AF37]' : 'text-white'
                )}
              >
                {player.username}
                {player.isCurrentUser && (
                  <span className="text-[10px] ml-1 text-[#666666]">(You)</span>
                )}
              </p>
              {player.wagered && (
                <p className="text-xs text-[#666666]">
                  ${player.wagered.toLocaleString()} wagered
                </p>
              )}
            </div>

            {/* Rank Badge */}
            {getRankBadge(player.rank)}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Mini leaderboard for sidebar/compact view
export function LeaderboardMini({ players, className }: { players: LeaderboardPlayer[]; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {players.slice(0, 5).map((player) => (
        <div
          key={player.rank}
          className="flex items-center gap-2 text-sm"
        >
          <span
            className={cn(
              'w-5 text-center font-bold',
              player.rank === 1 && 'text-[#FFD700]',
              player.rank === 2 && 'text-[#C0C0C0]',
              player.rank === 3 && 'text-[#CD7F32]',
              player.rank > 3 && 'text-[#666666]'
            )}
          >
            {player.rank}
          </span>
          <span className="flex-1 truncate text-white">{player.username}</span>
          {player.prize && (
            <span className="text-[#D4AF37] font-medium">
              ${player.prize.toLocaleString()}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
