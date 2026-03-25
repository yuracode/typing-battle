import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Player, Topic } from '../types';

interface UseBattleSocketOptions {
  onCountdown?: (count: number) => void;
  onBattleStart?: (topic: Topic, timeLimit: number) => void;
  onProgressUpdate?: (players: Player[]) => void;
  onBattleEnd?: (rankings: Player[]) => void;
  onPlayersUpdate?: (players: Player[]) => void;
}

export function useBattleSocket(options: UseBattleSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io('/', { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('players_update', ({ players }: { players: Player[] }) => {
      options.onPlayersUpdate?.(players);
    });
    socket.on('battle_countdown', ({ count }: { count: number }) => {
      options.onCountdown?.(count);
    });
    socket.on('battle_start', ({ topic, timeLimit }: { topic: Topic; timeLimit: number }) => {
      options.onBattleStart?.(topic, timeLimit);
    });
    socket.on('progress_update', ({ players }: { players: Player[] }) => {
      options.onProgressUpdate?.(players);
    });
    socket.on('battle_end', ({ rankings }: { rankings: Player[] }) => {
      options.onBattleEnd?.(rankings);
    });

    return () => { socket.disconnect(); };
  }, []);

  const joinBattle = (nickname: string, userId: string) => {
    socketRef.current?.emit('join_battle', { nickname, userId });
  };

  const startBattle = () => {
    socketRef.current?.emit('start_battle');
  };

  const lastProgressRef = useRef<number>(0);
  const sendProgress = useCallback((progress: number, wpm: number) => {
    const now = Date.now();
    if (now - lastProgressRef.current < 200) return;
    lastProgressRef.current = now;
    socketRef.current?.emit('typing_progress', { progress, wpm });
  }, []);

  const sendComplete = (wpm: number, accuracy: number) => {
    socketRef.current?.emit('typing_complete', { wpm, accuracy });
  };

  return { isConnected, joinBattle, startBattle, sendProgress, sendComplete };
}
