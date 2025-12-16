import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PageSection,
  Title,
  Card,
  CardBody,
  Button,
  Alert,
  Spinner,
  Tabs,
  Tab,
  TabTitleText,
  Modal,
  ModalVariant,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
} from '@patternfly/react-core';
import { ArrowLeftIcon } from '@patternfly/react-icons';
import { supabase, TABLES, TOURNAMENT_STATUS } from '../../services/supabase';
import { generateInitialMatches, generateNextRoundMatches, calculateTournamentProgress } from '../../utils/matchmaking';
import PlayerImport from '../../components/admin/PlayerImport';
import TournamentBracket from '../../components/tournament/TournamentBracket';
import MatchManagement from '../../components/admin/MatchManagement';

const TournamentManagementPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isNextRoundModalOpen, setIsNextRoundModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchTournamentData();
  }, [id]);

  const fetchTournamentData = async () => {
    try {
      setLoading(true);

      // Fetch tournament
      const { data: tournamentData, error: tournamentError } = await supabase
        .from(TABLES.TOURNAMENTS)
        .select('*')
        .eq('id', id)
        .single();

      if (tournamentError) throw tournamentError;
      setTournament(tournamentData);

      // Fetch players
      const { data: playersData, error: playersError } = await supabase
        .from(TABLES.PLAYERS)
        .select('*')
        .eq('tournament_id', id)
        .eq('is_active', true);

      if (playersError) throw playersError;
      setPlayers(playersData || []);

      // Fetch matches
      const { data: matchesData, error: matchesError } = await supabase
        .from(TABLES.MATCHES)
        .select('*')
        .eq('tournament_id', id)
        .order('round_number', { ascending: true })
        .order('match_number', { ascending: true });

      if (matchesError) throw matchesError;
      setMatches(matchesData || []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBracket = async () => {
    setGenerating(true);
    setError(null);

    try {
      const { matches: generatedMatches, totalRounds } = generateInitialMatches(players, id);

      const { error: insertError } = await supabase
        .from(TABLES.MATCHES)
        .insert(generatedMatches);

      if (insertError) throw insertError;

      // Update tournament
      await supabase
        .from(TABLES.TOURNAMENTS)
        .update({
          status: TOURNAMENT_STATUS.ACTIVE,
          current_round: 1,
          total_rounds: totalRounds,
        })
        .eq('id', id);

      setIsGenerateModalOpen(false);
      await fetchTournamentData();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateNextRound = async () => {
    setGenerating(true);
    setError(null);

    try {
      const currentRoundMatches = matches.filter(m => m.round_number === tournament.current_round);
      const nextRoundNumber = tournament.current_round + 1;

      const nextRoundMatches = generateNextRoundMatches(currentRoundMatches, nextRoundNumber, id);

      const { error: insertError } = await supabase
        .from(TABLES.MATCHES)
        .insert(nextRoundMatches);

      if (insertError) throw insertError;

      // Update tournament current round
      await supabase
        .from(TABLES.TOURNAMENTS)
        .update({ current_round: nextRoundNumber })
        .eq('id', id);

      setIsNextRoundModalOpen(false);
      await fetchTournamentData();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handlePlayersImported = async () => {
    await fetchTournamentData();
    setActiveTab(1); // Switch to bracket view
  };

  const handleMatchUpdated = async () => {
    await fetchTournamentData();
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

  if (!tournament) {
    return (
      <PageSection>
        <Alert variant="danger" title="Tournament not found" />
      </PageSection>
    );
  }

  const progress = matches.length > 0 ? calculateTournamentProgress(matches, tournament.total_rounds) : null;
  const canGenerateNextRound = progress?.currentRoundCompleted && !progress?.isComplete;
  const currentRoundMatches = matches.filter(m => m.round_number === tournament.current_round);

  return (
    <PageSection>
      <div style={{ marginBottom: '1rem' }}>
        <Button
          variant="link"
          icon={<ArrowLeftIcon />}
          onClick={() => navigate('/admin/tournaments')}
        >
          Back to Tournaments
        </Button>
      </div>

      <Title headingLevel="h1" size="2xl" style={{ marginBottom: '0.5rem' }}>
        {tournament.name}
      </Title>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Badge color={tournament.status === 'active' ? 'green' : 'grey'}>
          {tournament.status}
        </Badge>
        <span style={{ color: '#6a6e73' }}>{tournament.sport_type}</span>
        {progress && (
          <span style={{ color: '#6a6e73' }}>
            Round {tournament.current_round} of {tournament.total_rounds} • {Math.round(progress.percentage)}% Complete
          </span>
        )}
      </div>

      {error && (
        <Alert
          variant="danger"
          title="Error"
          style={{ marginBottom: '1rem' }}
        >
          {error}
        </Alert>
      )}

      <Card style={{ marginBottom: '1rem' }}>
        <CardBody>
          <DescriptionList isHorizontal>
            <DescriptionListGroup>
              <DescriptionListTerm>Total Players</DescriptionListTerm>
              <DescriptionListDescription>{players.length}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Total Matches</DescriptionListTerm>
              <DescriptionListDescription>{matches.length}</DescriptionListDescription>
            </DescriptionListGroup>
            {progress && (
              <DescriptionListGroup>
                <DescriptionListTerm>Completed Matches</DescriptionListTerm>
                <DescriptionListDescription>{progress.completedMatches} / {progress.totalMatches}</DescriptionListDescription>
              </DescriptionListGroup>
            )}
          </DescriptionList>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            {players.length >= 2 && matches.length === 0 && (
              <Button
                variant="primary"
                onClick={() => setIsGenerateModalOpen(true)}
              >
                Generate Tournament Bracket
              </Button>
            )}

            {canGenerateNextRound && (
              <Button
                variant="primary"
                onClick={() => setIsNextRoundModalOpen(true)}
              >
                Generate Next Round
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      <Tabs
        activeKey={activeTab}
        onSelect={(_, tabIndex) => setActiveTab(tabIndex)}
      >
        <Tab eventKey={0} title={<TabTitleText>Players</TabTitleText>}>
          <div style={{ padding: '1.5rem 0' }}>
            <PlayerImport
              tournamentId={id}
              onPlayersImported={handlePlayersImported}
            />

            {players.length > 0 && (
              <Card style={{ marginTop: '1.5rem' }}>
                <CardBody>
                  <Title headingLevel="h3" size="lg">
                    Registered Players ({players.length})
                  </Title>
                  <div style={{ marginTop: '1rem' }}>
                    {Object.entries(
                      players.reduce((acc, player) => {
                        if (!acc[player.team_name]) {
                          acc[player.team_name] = [];
                        }
                        acc[player.team_name].push(player);
                        return acc;
                      }, {})
                    ).map(([team, teamPlayers]) => (
                      <div key={team} style={{ marginBottom: '1rem' }}>
                        <strong>{team}</strong> ({teamPlayers.length} players)
                        <ul>
                          {teamPlayers.map(player => (
                            <li key={player.id}>
                              {player.name}
                              {player.email && ` - ${player.email}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </Tab>

        <Tab eventKey={1} title={<TabTitleText>Tournament Bracket</TabTitleText>}>
          <div style={{ padding: '1.5rem 0' }}>
            <TournamentBracket matches={matches} players={players} />
          </div>
        </Tab>

        <Tab eventKey={2} title={<TabTitleText>Match Management</TabTitleText>}>
          <div style={{ padding: '1.5rem 0' }}>
            {currentRoundMatches.length > 0 ? (
              <Card>
                <CardBody>
                  <Title headingLevel="h3" size="lg">
                    Current Round Matches
                  </Title>
                  <div style={{ marginTop: '1rem' }}>
                    {currentRoundMatches.map(match => {
                      const player1 = players.find(p => p.id === match.player1_id);
                      const player2 = players.find(p => p.id === match.player2_id);

                      return (
                        <div
                          key={match.id}
                          style={{
                            padding: '1rem',
                            border: '1px solid #D2D2D2',
                            borderRadius: '4px',
                            marginBottom: '1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <strong>Match {match.match_number}</strong>
                            <br />
                            {player1?.name || 'TBD'} vs {player2?.name || 'TBD'}
                            {match.winner_id && (
                              <Badge color="green" style={{ marginLeft: '1rem' }}>
                                Winner: {players.find(p => p.id === match.winner_id)?.name}
                              </Badge>
                            )}
                          </div>
                          <MatchManagement
                            match={match}
                            players={players}
                            onMatchUpdated={handleMatchUpdated}
                          />
                        </div>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>
            ) : (
              <Alert variant="info" title="No matches in current round" />
            )}
          </div>
        </Tab>
      </Tabs>

      <Modal
        variant={ModalVariant.small}
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        aria-labelledby="generate-bracket-modal-title"
        aria-describedby="generate-bracket-modal-body"
      >
        <ModalHeader title="Generate Tournament Bracket" labelId="generate-bracket-modal-title" />
        <ModalBody id="generate-bracket-modal-body">
          <p>
            This will generate a tournament bracket for <strong>{players.length}</strong> players.
            Players will be randomly matched for the first round.
          </p>
          <p style={{ marginTop: '1rem' }}>
            Do you want to continue?
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            key="confirm"
            variant="primary"
            onClick={handleGenerateBracket}
            isDisabled={generating}
          >
            {generating ? <Spinner size="md" /> : 'Generate'}
          </Button>
          <Button key="cancel" variant="link" onClick={() => setIsGenerateModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        variant={ModalVariant.small}
        isOpen={isNextRoundModalOpen}
        onClose={() => setIsNextRoundModalOpen(false)}
        aria-labelledby="generate-next-round-modal-title"
        aria-describedby="generate-next-round-modal-body"
      >
        <ModalHeader title="Generate Next Round" labelId="generate-next-round-modal-title" />
        <ModalBody id="generate-next-round-modal-body">
          <p>
            This will generate the next round of matches based on the winners from Round {tournament.current_round}.
          </p>
          <p style={{ marginTop: '1rem' }}>
            Do you want to continue?
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            key="confirm"
            variant="primary"
            onClick={handleGenerateNextRound}
            isDisabled={generating}
          >
            {generating ? <Spinner size="md" /> : 'Generate'}
          </Button>
          <Button key="cancel" variant="link" onClick={() => setIsNextRoundModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </PageSection>
  );
};

export default TournamentManagementPage;

