import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface Player {
    id: string;
    name: string;
    color: 'red' | 'blue' | 'orange' | 'white';
    isTurn: boolean;
}

interface TradeItem {
    type: string;
    count: number;
}

interface TradeOffer {
    id: string;
    fromPlayerId: string;
    fromPlayerName: string;
    offer: TradeItem[];
    want: TradeItem[];
    status: 'pending' | 'accepted' | 'rejected' | 'counter';
}

interface TradeResolution {
    type: 'accepted' | 'countered' | 'cancelled';
    fromPlayerName: string;
    resolvedBy: string;
    timestamp: number;
}

interface GameState {
    socket: Socket | null;
    isConnected: boolean;
    room: { id: string; pin: string } | null;
    player: Player | null;
    players: Player[];
    activeTrades: TradeOffer[];
    history: string[];
    recentResolutions: TradeResolution[];
    error: string | null;

    connect: () => void;
    createRoom: (name: string, color: Player['color']) => void;
    joinRoom: (pin: string, name: string, color: Player['color']) => void;
    claimTurn: () => void;
    createOffer: (offer: TradeItem[], want: TradeItem[]) => void;
    respondToOffer: (offerId: string, status: 'accepted' | 'rejected' | 'countered') => void;
    leaveRoom: () => void;
    clearError: () => void;
}

export type { Player, TradeItem, TradeOffer, TradeResolution };

export const useGameStore = create<GameState>((set, get) => ({
    socket: null,
    isConnected: false,
    room: null,
    player: null,
    players: [],
    activeTrades: [],
    history: [],
    recentResolutions: [],
    error: null,

    connect: () => {
        if (get().socket) return;

        const socket = io('/', {
            path: '/socket.io',
            autoConnect: true,
        });

        socket.on('connect', () => {
            set({ isConnected: true });
            const state = get();
            if (state.room && state.player) {
                socket.emit('join_room', {
                    pin: state.room.pin,
                    name: state.player.name,
                    color: state.player.color,
                });
            }
        });

        socket.on('disconnect', () => {
            set({ isConnected: false });
        });

        socket.on('room_joined', (data) => {
            set({
                room: data.room,
                player: data.player,
                players: data.players,
                error: null,
            });
        });

        socket.on('player_update', (players: Player[]) => {
            const currentPlayer = get().player;
            if (currentPlayer) {
                const updatedSelf = players.find((p) => p.id === currentPlayer.id);
                set({ players, player: updatedSelf || currentPlayer });
            } else {
                set({ players });
            }
        });

        socket.on('trade_update', (activeTrades: TradeOffer[]) => {
            set({ activeTrades });
        });

        socket.on('history_update', (history: string[]) => {
            set({ history });
        });

        socket.on('trade_resolved', (data: { type: 'accepted' | 'countered' | 'cancelled'; fromPlayerName: string; resolvedBy: string }) => {
            const resolution: TradeResolution = { ...data, timestamp: Date.now() };
            set(state => ({
                recentResolutions: [resolution, ...state.recentResolutions].slice(0, 5)
            }));
            setTimeout(() => {
                set(state => ({
                    recentResolutions: state.recentResolutions.filter(r => Date.now() - r.timestamp < 5000)
                }));
            }, 5000);
        });

        socket.on('error', (message: string) => {
            set({ error: message });
            if (get().room && message.toLowerCase().includes('not found')) {
                set({ room: null, player: null, players: [], activeTrades: [], history: [] });
            }
        });

        set({ socket });
    },

    createRoom: (name, color) => {
        get().socket?.emit('create_room', { name, color });
    },

    joinRoom: (pin, name, color) => {
        get().socket?.emit('join_room', { pin, name, color });
    },

    claimTurn: () => {
        get().socket?.emit('claim_turn');
    },

    createOffer: (offer, want) => {
        get().socket?.emit('create_offer', { offer, want });
    },

    respondToOffer: (offerId, status) => {
        get().socket?.emit('respond_offer', { offerId, status });
    },

    leaveRoom: () => {
        get().socket?.emit('leave_room');
        set({ room: null, player: null, players: [], activeTrades: [], history: [], recentResolutions: [], error: null });
    },

    clearError: () => {
        set({ error: null });
    },
}));
