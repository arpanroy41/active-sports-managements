import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageSection,
  Title,
  Card,
  CardBody,
  CardTitle,
  Button,
  Gallery,
  Alert,
  Spinner,
  Badge,
  EmptyState,
  EmptyStateBody,
} from '@patternfly/react-core';
import { TrophyIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { supabase, TABLES } from '../../services/supabase';
import TournamentCreation from '../../components/admin/TournamentCreation';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from(TABLES.TOURNAMENTS)
        .select('*, users(name)')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTournaments(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTournamentClick = (tournamentId) => {
    navigate(`/admin/tournaments/${tournamentId}`);
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
    <PageSection>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
      }}>
        <Title headingLevel="h1" size="2xl">
          Tournament Management
        </Title>
        <Button
          variant="primary"
          icon={<PlusCircleIcon />}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create Tournament'}
        </Button>
      </div>

      {error && (
        <Alert
          variant="danger"
          title="Error loading tournaments"
          style={{ marginBottom: '1rem' }}
        >
          {error}
        </Alert>
      )}

      {showCreateForm && (
        <div style={{ marginBottom: '2rem' }}>
          <TournamentCreation />
        </div>
      )}

      {tournaments.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState 
              titleText="No Tournaments Yet" 
              headingLevel="h2"
              icon={TrophyIcon}
            >
              <EmptyStateBody>
                Get started by creating your first tournament. You can import players,
                generate brackets, and manage matches all in one place.
              </EmptyStateBody>
              <Button
                variant="primary"
                onClick={() => setShowCreateForm(true)}
              >
                Create Your First Tournament
              </Button>
            </EmptyState>
          </CardBody>
        </Card>
      ) : (
        <Gallery hasGutter minWidths={{ default: '100%', md: '350px' }}>
          {tournaments.map((tournament) => (
            <Card
              key={tournament.id}
              isClickable
              onClick={() => handleTournamentClick(tournament.id)}
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
                    <div>Round {tournament.current_round} of {tournament.total_rounds}</div>
                  )}
                  <div>Created by: {tournament.users?.name || 'Unknown'}</div>
                  <div>
                    Created: {new Date(tournament.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </Gallery>
      )}
    </PageSection>
  );
};

export default AdminDashboard;

