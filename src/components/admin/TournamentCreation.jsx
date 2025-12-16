import { useState } from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  TextInput,
  TextArea,
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  Button,
  Alert,
  Spinner,
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';
import { supabase, TABLES, TOURNAMENT_STATUS, SPORT_TYPES } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

const TournamentCreation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    sport_type: '',
    description: '',
  });
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (_, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event, value) => {
    setFormData(prev => ({ ...prev, sport_type: value }));
    setIsOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: createError } = await supabase
        .from(TABLES.TOURNAMENTS)
        .insert([{
          name: formData.name,
          sport_type: formData.sport_type,
          description: formData.description,
          status: TOURNAMENT_STATUS.DRAFT,
          created_by: user.id,
        }])
        .select()
        .single();

      if (createError) throw createError;

      navigate(`/admin/tournaments/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardTitle>Create New Tournament</CardTitle>
      <CardBody>
        {error && (
          <Alert
            variant="danger"
            title="Error creating tournament"
            style={{ marginBottom: '1rem' }}
          >
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <FormGroup label="Tournament Name" isRequired fieldId="name">
            <TextInput
              isRequired
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange('name')}
              placeholder="e.g., Office Cricket Championship"
            />
          </FormGroup>

          <FormGroup label="Sport Type" isRequired fieldId="sport_type">
            <Select
              id="sport-type-select"
              isOpen={isOpen}
              selected={formData.sport_type}
              onSelect={onSelect}
              onOpenChange={(isOpen) => setIsOpen(isOpen)}
              toggle={(toggleRef) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={onToggle}
                  isExpanded={isOpen}
                  style={{ width: '100%' }}
                >
                  {formData.sport_type || 'Select a sport'}
                </MenuToggle>
              )}
            >
              <SelectList>
                {SPORT_TYPES.map((sport, index) => (
                  <SelectOption key={index} value={sport}>
                    {sport}
                  </SelectOption>
                ))}
              </SelectList>
            </Select>
          </FormGroup>

          <FormGroup label="Description" fieldId="description">
            <TextArea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange('description')}
              placeholder="Enter tournament description..."
              rows={4}
            />
          </FormGroup>

          <Button
            type="submit"
            variant="primary"
            isDisabled={!formData.name || !formData.sport_type || loading}
          >
            {loading ? <Spinner size="md" /> : 'Create Tournament'}
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
};

export default TournamentCreation;

