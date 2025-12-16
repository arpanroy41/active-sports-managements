import { useState, useEffect } from 'react';
import {
  PageSection,
  Title,
  Card,
  CardBody,
  CardTitle,
  Gallery,
  Alert,
  Spinner,
  Badge,
  EmptyState,
  EmptyStateBody,
  Tabs,
  Tab,
  TabTitleText,
  Modal,
  ModalVariant,
  ModalHeader,
  ModalBody,
  Button,
} from '@patternfly/react-core';
import { TrophyIcon } from '@patternfly/react-icons';
import { supabase, TABLES } from '../services/supabase';
import TournamentBracket from '../components/tournament/TournamentBracket';

const PlayerDashboard = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [tournamentMatches, setTournamentMatches] = useState([]);
  const [tournamentPlayers, setTournamentPlayers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from(TABLES.TOURNAMENTS)
        .select('*')
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTournaments(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTournament = async (tournament) => {
    setSelectedTournament(tournament);
    setIsModalOpen(true);

    try {
      // Fetch matches
      const { data: matchesData, error: matchesError } = await supabase
        .from(TABLES.MATCHES)
        .select('*')
        .eq('tournament_id', tournament.id)
        .order('round_number', { ascending: true })
        .order('match_number', { ascending: true });

      if (matchesError) throw matchesError;
      setTournamentMatches(matchesData || []);

      // Fetch players
      const { data: playersData, error: playersError } = await supabase
        .from(TABLES.PLAYERS)
        .select('*')
        .eq('tournament_id', tournament.id);

      if (playersError) throw playersError;
      setTournamentPlayers(playersData || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'completed':
        return 'blue';
      default:
        return 'grey';
    }
  };

  if (loading) {
    return (
      <PageSection>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Spinner size="xl" />
        </div>
      </PageSection>
    );
  }

  return (
    <>
      <PageSection>
        <Title headingLevel="h1" size="2xl" style={{ marginBottom: '2rem' }}>
          Active Tournaments
        </Title>

        {error && (
          <Alert
            variant="danger"
            title="Error loading tournaments"
            style={{ marginBottom: '1rem' }}
          >
            {error}
          </Alert>
        )}

        {tournaments.length === 0 ? (
          <Card>
            <CardBody>
              <EmptyState 
                titleText="No Active Tournaments" 
                headingLevel="h2"
                icon={TrophyIcon}
              >
                <EmptyStateBody>
                  There are no tournaments available at the moment. Check back later
                  or contact your administrator to create one.
                </EmptyStateBody>
              </EmptyState>
            </CardBody>
          </Card>
        ) : (
          <Gallery hasGutter minWidths={{ default: '100%', md: '350px' }}>
            {tournaments.map((tournament) => (
              <Card
                key={tournament.id}
                isClickable
                onClick={() => handleViewTournament(tournament)}
                style={{ cursor: 'pointer' }}
              >
                <CardTitle>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span>{tournament.name}</span>
                    <Badge color={getStatusColor(tournament.status)}>
                      {tournament.status}
                    </Badge>
                  </div>
                </CardTitle>
                <CardBody>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Sport:</strong> {tournament.sport_type}
                  </div>
                  {tournament.description && (
                    <div style={{ 
                      marginBottom: '0.5rem',
                      color: '#6a6e73',
                      fontSize: '0.9rem',
                    }}>
                      {tournament.description}
                    </div>
                  )}
                  <div style={{ 
                    marginTop: '1rem',
                    fontSize: '0.85rem',
                    color: '#6a6e73',
                  }}>
                    {tournament.current_round > 0 && (
                      <div>
                        Current Round: {tournament.current_round} of {tournament.total_rounds}
                      </div>
                    )}
                    <div>
                      Started: {new Date(tournament.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </Gallery>
        )}
      </PageSection>

      <Modal
        variant={ModalVariant.large}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        style={{ width: '90vw', maxWidth: '1400px' }}
        aria-labelledby="tournament-details-modal-title"
        aria-describedby="tournament-details-modal-body"
      >
        {selectedTournament && (
          <>
            <ModalHeader title={selectedTournament.name} labelId="tournament-details-modal-title" />
            <ModalBody id="tournament-details-modal-body">
              <div style={{ marginBottom: '1rem' }}>
                <Badge color={getStatusColor(selectedTournament.status)}>
                  {selectedTournament.status}
                </Badge>
                <span style={{ marginLeft: '1rem', color: '#6a6e73' }}>
                  {selectedTournament.sport_type}
                </span>
                {selectedTournament.current_round > 0 && (
                  <span style={{ marginLeft: '1rem', color: '#6a6e73' }}>
                    Round {selectedTournament.current_round} of {selectedTournament.total_rounds}
                  </span>
                )}
              </div>

              {selectedTournament.description && (
                <p style={{ color: '#6a6e73', marginBottom: '1.5rem' }}>
                  {selectedTournament.description}
                </p>
              )}

            <Tabs defaultActiveKey={0}>
              <Tab eventKey={0} title={<TabTitleText>Bracket</TabTitleText>}>
                <div style={{ padding: '1.5rem 0' }}>
                  <TournamentBracket
                    matches={tournamentMatches}
                    players={tournamentPlayers}
                  />
                </div>
              </Tab>

              <Tab eventKey={1} title={<TabTitleText>Players</TabTitleText>}>
                <div style={{ padding: '1.5rem 0' }}>
                  {tournamentPlayers.length > 0 ? (
                    <div>
                      <Title headingLevel="h3" size="lg">
                        All Players ({tournamentPlayers.length})
                      </Title>
                      <div style={{ marginTop: '1rem' }}>
                        {Object.entries(
                          tournamentPlayers.reduce((acc, player) => {
                            if (!acc[player.team_name]) {
                              acc[player.team_name] = [];
                            }
                            acc[player.team_name].push(player);
                            return acc;
                          }, {})
                        ).map(([team, teamPlayers]) => (
                          <Card key={team} style={{ marginBottom: '1rem' }}>
                            <CardBody>
                              <strong>{team}</strong> ({teamPlayers.length} players)
                              <ul style={{ marginTop: '0.5rem' }}>
                                {teamPlayers.map(player => (
                                  <li key={player.id}>{player.name}</li>
                                ))}
                              </ul>
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Alert variant="info" title="No players registered yet" />
                  )}
                </div>
              </Tab>
            </Tabs>
            </ModalBody>
          </>
        )}
      </Modal>
    </>
  );
};

export default PlayerDashboard;

