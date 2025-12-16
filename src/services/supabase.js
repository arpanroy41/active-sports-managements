import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table names
export const TABLES = {
  USERS: 'users',
  TOURNAMENTS: 'tournaments',
  PLAYERS: 'players',
  MATCHES: 'matches',
  BRACKET_POSITIONS: 'bracket_positions',
  SETTINGS: 'settings',
};

// User roles
export const ROLES = {
  PLAYER: 'player',
  ADMIN: 'admin',
};

// Tournament status
export const TOURNAMENT_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

// Match status
export const MATCH_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  BYE: 'bye',
};

// Sport types
export const SPORT_TYPES = [
  'Cricket',
  'Football',
  'Badminton',
  'Table Tennis',
  'Chess',
  'Volleyball',
  'Basketball',
  'Tennis',
];

