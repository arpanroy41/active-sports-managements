import { useState } from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  Button,
  Modal,
  ModalVariant,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Radio,
  TextArea,
  Alert,
  Spinner,
} from '@patternfly/react-core';
import { supabase, TABLES, MATCH_STATUS } from '../../services/supabase';

const MatchManagement = ({ match, players, onMatchUpdated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [notes, setNotes] = useState(match?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const player1 = players.find(p => p.id === match.player1_id);
  const player2 = players.find(p => p.id === match.player2_id);

  const handleOpenModal = () => {
    setSelectedWinner(match.winner_id);
    setNotes(match.notes || '');
    setIsModalOpen(true);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedWinner) {
      setError('Please select a winner');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from(TABLES.MATCHES)
        .update({
          winner_id: selectedWinner,
          status: MATCH_STATUS.COMPLETED,
          completed_at: new Date().toISOString(),
          notes,
        })
        .eq('id', match.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setIsModalOpen(false);
      if (onMatchUpdated) {
        onMatchUpdated(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (match.status === 'bye') {
    return null;
  }

  return (
    <>
      <Button
        variant={match.winner_id ? 'secondary' : 'primary'}
        size="sm"
        onClick={handleOpenModal}
      >
        {match.winner_id ? 'Update Result' : 'Set Winner'}
      </Button>

      <Modal
        variant={ModalVariant.medium}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="match-result-modal-title"
        aria-describedby="match-result-modal-body"
      >
        <ModalHeader 
          title={`Match ${match.match_number} - Round ${match.round_number}`} 
          labelId="match-result-modal-title" 
        />
        <ModalBody id="match-result-modal-body">
          {error && (
            <Alert
              variant="danger"
              title="Error"
              style={{ marginBottom: '1rem' }}
            >
              {error}
            </Alert>
          )}

          <Form>
            <FormGroup label="Select Winner" isRequired>
              <Radio
                id={`winner-player1-${match.id}`}
                name={`winner-${match.id}`}
                label={player1?.name || 'Player 1'}
                isChecked={selectedWinner === match.player1_id}
                onChange={() => setSelectedWinner(match.player1_id)}
              />
              <Radio
                id={`winner-player2-${match.id}`}
                name={`winner-${match.id}`}
                label={player2?.name || 'Player 2'}
                isChecked={selectedWinner === match.player2_id}
                onChange={() => setSelectedWinner(match.player2_id)}
              />
            </FormGroup>

            <FormGroup label="Notes (Optional)" fieldId="notes">
              <TextArea
                id="notes"
                value={notes}
                onChange={(_, value) => setNotes(value)}
                placeholder="Add any notes about this match..."
                rows={3}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            key="confirm"
            variant="primary"
            onClick={handleSubmit}
            isDisabled={!selectedWinner || loading}
          >
            {loading ? <Spinner size="md" /> : 'Save Result'}
          </Button>
          <Button key="cancel" variant="link" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default MatchManagement;

