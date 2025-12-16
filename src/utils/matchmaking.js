/**
 * Matchmaking and Tournament Bracket Generation Utilities
 */

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Calculate next power of 2
 * @param {number} n - Number
 * @returns {number} Next power of 2
 */
const nextPowerOf2 = (n) => {
  return Math.pow(2, Math.ceil(Math.log2(n)));
};

/**
 * Generate initial round matches with randomization
 * @param {Array} players - Array of player objects
 * @param {string} tournamentId - Tournament ID
 * @returns {Object} Matches and metadata
 */
export const generateInitialMatches = (players, tournamentId) => {
  if (!players || players.length < 2) {
    throw new Error('At least 2 players are required to create a tournament');
  }

  // Randomize player order
  const shuffledPlayers = shuffleArray(players);
  
  // Calculate bracket size (next power of 2)
  const bracketSize = nextPowerOf2(shuffledPlayers.length);
  const totalRounds = Math.log2(bracketSize);
  const byeCount = bracketSize - shuffledPlayers.length;

  console.log('Tournament generation:', {
    playerCount: shuffledPlayers.length,
    bracketSize,
    totalRounds,
    byeCount,
  });

  // Create first round matches
  const matches = [];
  let matchNumber = 1;

  // Fill bracket with players
  const bracket = [...shuffledPlayers];
  
  // Add bye placeholders
  for (let i = 0; i < byeCount; i++) {
    bracket.push(null); // null represents a bye
  }

  // Create pairs for first round
  for (let i = 0; i < bracket.length; i += 2) {
    const player1 = bracket[i];
    const player2 = bracket[i + 1];

    // If one player has a bye, they automatically advance
    if (!player2) {
      matches.push({
        tournament_id: tournamentId,
        round_number: 1,
        match_number: matchNumber++,
        player1_id: player1.id,
        player2_id: null,
        winner_id: player1.id, // Auto-win for bye
        status: 'bye',
      });
    } else {
      matches.push({
        tournament_id: tournamentId,
        round_number: 1,
        match_number: matchNumber++,
        player1_id: player1.id,
        player2_id: player2.id,
        winner_id: null,
        status: 'pending',
      });
    }
  }

  return {
    matches,
    totalRounds: Math.ceil(totalRounds),
    bracketSize,
    byeCount,
  };
};

/**
 * Generate next round matches based on previous round winners
 * @param {Array} previousMatches - Matches from previous round
 * @param {number} nextRoundNumber - Next round number
 * @param {string} tournamentId - Tournament ID
 * @returns {Array} Next round matches
 */
export const generateNextRoundMatches = (previousMatches, nextRoundNumber, tournamentId) => {
  // Get winners from previous round
  const winners = previousMatches
    .filter(match => match.winner_id)
    .map(match => match.winner_id);

  if (winners.length < 2) {
    throw new Error('Not enough winners to generate next round');
  }

  // Create matches by pairing winners
  const nextMatches = [];
  let matchNumber = 1;

  for (let i = 0; i < winners.length; i += 2) {
    if (i + 1 < winners.length) {
      nextMatches.push({
        tournament_id: tournamentId,
        round_number: nextRoundNumber,
        match_number: matchNumber++,
        player1_id: winners[i],
        player2_id: winners[i + 1],
        winner_id: null,
        status: 'pending',
      });
    } else {
      // Odd number of winners, give bye to last player
      nextMatches.push({
        tournament_id: tournamentId,
        round_number: nextRoundNumber,
        match_number: matchNumber++,
        player1_id: winners[i],
        player2_id: null,
        winner_id: winners[i],
        status: 'bye',
      });
    }
  }

  return nextMatches;
};

/**
 * Get round name based on number of remaining players
 * @param {number} playersRemaining - Number of players in this round
 * @returns {string} Round name
 */
export const getRoundName = (playersRemaining) => {
  switch (playersRemaining) {
    case 2:
      return 'Final';
    case 4:
      return 'Semi-Final';
    case 8:
      return 'Quarter-Final';
    case 16:
      return 'Round of 16';
    case 32:
      return 'Round of 32';
    default:
      return `Round ${Math.log2(playersRemaining)}`;
  }
};

/**
 * Calculate tournament progress
 * @param {Array} matches - All tournament matches
 * @param {number} totalRounds - Total rounds in tournament
 * @returns {Object} Progress information
 */
export const calculateTournamentProgress = (matches, totalRounds) => {
  const completedMatches = matches.filter(m => m.status === 'completed' || m.status === 'bye').length;
  const totalMatches = matches.length;
  const currentRound = Math.max(...matches.map(m => m.round_number));
  const currentRoundMatches = matches.filter(m => m.round_number === currentRound);
  const currentRoundCompleted = currentRoundMatches.every(m => m.winner_id !== null);

  return {
    completedMatches,
    totalMatches,
    percentage: (completedMatches / totalMatches) * 100,
    currentRound,
    totalRounds,
    currentRoundCompleted,
    isComplete: currentRound === totalRounds && currentRoundCompleted,
  };
};

