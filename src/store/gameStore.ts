import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface Player {
    id: string;
    name: string;
    color: 'red' | 'blue' | 'orange' | 'white';
    isTurn: boolean;
}

interface TradeItem {
    type: string; // 'wood', 'brick', 'sheep', 'wheat', 'ore'
    count: number;
}

interface TradeOffer {
    id: string;
    fromPlayerId: string;
    offer: TradeItem[];
    want: TradeItem[];
    status: 'pending' | 'accepted' | 'rejected' | 'counter';
}

interface GameState {
    socket: Socket | null;
    isConnected: boolean;
    room: { id: string; pin: string } | null;
    player: Player | null;
    players: Player[];
    activeTrades: TradeOffer[];
    history: string[];

    // Actions
    connect: () => void;
    createRoom: (name: string, color: Player['color']) => void;
    joinRoom: (pin: string, name: string, color: Player['color']) => void;
    claimTurn: () => void;
    createOffer: (offer: TradeItem[], want: TradeItem[]) => void;
    respondToOffer: (offerId: string, status: 'accepted' | 'rejected') => void;
    leaveRoom: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    socket: null,
    isConnected: false,
    room: null,
    player: null,
    players: [],
    activeTrades: [],
    history: [],

    connect: () => {
        if (get().socket) return;

        const socket = io('/', {
            path: '/socket.io',
            autoConnect: true,
        });

        socket.on('connect', () => {
            set({ isConnected: true });
        });

        socket.on('disconnect', () => {
            set({ isConnected: false });
        });

        // Game Events
        socket.on('room_joined', (data) => {
            set({ room: data.room, player: data.player, players: data.players });
        });

        socket.on('player_update', (players) => {
            set({ players });
        });

        socket.on('trade_update', (activeTrades) => {
            set({ activeTrades });
        });

        socket.on('history_update', (history) => {
            set({ history });
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
        set({ room: null, player: null, players: [], activeTrades: [], history: [] });
        // Optional: emit 'leave_room' if server needs strict tracking
    }
}));
