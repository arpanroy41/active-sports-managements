import { useMemo } from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  Badge,
} from '@patternfly/react-core';
import { getRoundName } from '../../utils/matchmaking';

const TournamentBracket = ({ matches = [], players = [] }) => {
  // Group matches by round
  const matchesByRound = useMemo(() => {
    const rounds = {};
    matches.forEach(match => {
      if (!rounds[match.round_number]) {
        rounds[match.round_number] = [];
      }
      rounds[match.round_number].push(match);
    });
    return rounds;
  }, [matches]);

  const roundNumbers = Object.keys(matchesByRound).sort((a, b) => Number(a) - Number(b));

  // Create player lookup
  const playerLookup = useMemo(() => {
    const lookup = {};
    players.forEach(player => {
      lookup[player.id] = player;
    });
    return lookup;
  }, [players]);

  const getPlayerName = (playerId) => {
    if (!playerId) return 'TBD';
    return playerLookup[playerId]?.name || 'Unknown';
  };

  const getMatchStatusColor = (match) => {
    if (match.status === 'completed') return 'green';
    if (match.status === 'in_progress') return 'blue';
    if (match.status === 'bye') return 'grey';
    return 'grey';
  };

  const getMatchWinnerIndicator = (match, playerId) => {
    if (match.winner_id === playerId) {
      return '✓';
    }
    return '';
  };

  return (
    <div style={{ overflowX: 'auto', padding: '1rem' }}>
      <div style={{ 
        display: 'flex', 
        gap: '2rem',
        minWidth: 'fit-content',
      }}>
        {roundNumbers.map((roundNum) => {
          const roundMatches = matchesByRound[roundNum];
          const playersInRound = roundMatches.length * 2;
          const roundName = getRoundName(playersInRound);

          return (
            <div key={roundNum} style={{ minWidth: '250px' }}>
              <CardTitle style={{ 
                textAlign: 'center', 
                marginBottom: '1rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
              }}>
                {roundName}
                <br />
                <span style={{ fontSize: '0.85rem', color: '#6a6e73' }}>
                  Round {roundNum}
                </span>
              </CardTitle>

              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '2rem',
                paddingTop: '1rem',
              }}>
                {roundMatches.map((match) => (
                  <Card 
                    key={match.id} 
                    isCompact
                    style={{ 
                      border: match.winner_id ? '2px solid #3E8635' : '1px solid #D2D2D2',
                    }}
                  >
                    <CardBody>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem',
                      }}>
                        <span style={{ fontSize: '0.85rem', color: '#6a6e73' }}>
                          Match {match.match_number}
                        </span>
                        <Badge color={getMatchStatusColor(match)}>
                          {match.status}
                        </Badge>
                      </div>

                      <div style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}>
                        <div style={{
                          padding: '0.5rem',
                          backgroundColor: match.winner_id === match.player1_id ? '#F0F0F0' : 'white',
                          borderRadius: '4px',
                          border: '1px solid #D2D2D2',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                          <span style={{ 
                            fontWeight: match.winner_id === match.player1_id ? 'bold' : 'normal',
                          }}>
                            {getPlayerName(match.player1_id)}
                          </span>
                          {match.winner_id === match.player1_id && (
                            <span style={{ color: '#3E8635', fontSize: '1.2rem' }}>
                              {getMatchWinnerIndicator(match, match.player1_id)}
                            </span>
                          )}
                        </div>

                        <div style={{
                          padding: '0.5rem',
                          backgroundColor: match.winner_id === match.player2_id ? '#F0F0F0' : 'white',
                          borderRadius: '4px',
                          border: '1px solid #D2D2D2',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                          <span style={{ 
                            fontWeight: match.winner_id === match.player2_id ? 'bold' : 'normal',
                          }}>
                            {getPlayerName(match.player2_id)}
                          </span>
                          {match.winner_id === match.player2_id && (
                            <span style={{ color: '#3E8635', fontSize: '1.2rem' }}>
                              {getMatchWinnerIndicator(match, match.player2_id)}
                            </span>
                          )}
                        </div>
                      </div>

                      {match.notes && (
                        <div style={{ 
                          marginTop: '0.5rem', 
                          fontSize: '0.85rem', 
                          color: '#6a6e73',
                          fontStyle: 'italic',
                        }}>
                          {match.notes}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {matches.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          color: '#6a6e73',
        }}>
          No matches have been generated yet. Import players and generate the bracket to get started.
        </div>
      )}
    </div>
  );
};

export default TournamentBracket;

