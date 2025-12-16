import { useState } from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  Button,
  FileUpload,
  Alert,
  List,
  ListItem,
  Modal,
  ModalVariant,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from '@patternfly/react-core';
import { DownloadIcon, UploadIcon } from '@patternfly/react-icons';
import { parseExcelFile, validatePlayers, downloadSampleTemplate } from '../../utils/excelParser';
import { supabase, TABLES } from '../../services/supabase';

const PlayerImport = ({ tournamentId, onPlayersImported }) => {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedPlayers, setParsedPlayers] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileChange = (_, file) => {
    setFile(file);
    setFilename(file?.name || '');
    setParsedPlayers(null);
    setValidationResult(null);
    setError(null);
  };

  const handleClear = () => {
    setFile(null);
    setFilename('');
    setParsedPlayers(null);
    setValidationResult(null);
    setError(null);
  };

  const handleParseFile = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const players = await parseExcelFile(file);
      const validation = validatePlayers(players);

      setParsedPlayers(players);
      setValidationResult(validation);

      if (validation.valid) {
        setIsModalOpen(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!parsedPlayers || !tournamentId) return;

    setIsLoading(true);

    try {
      // Prepare players for database
      const playersToInsert = parsedPlayers.map(player => ({
        tournament_id: tournamentId,
        name: player.name,
        email: player.email || null,
        phone: player.phone || null,
        team_name: player.team_name,
        is_active: true,
      }));

      const { data, error: insertError } = await supabase
        .from(TABLES.PLAYERS)
        .insert(playersToInsert)
        .select();

      if (insertError) throw insertError;

      setIsModalOpen(false);
      handleClear();
      
      if (onPlayersImported) {
        onPlayersImported(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardTitle>Import Players from Excel</CardTitle>
        <CardBody>
          <div style={{ marginBottom: '1rem' }}>
            <Button
              variant="link"
              icon={<DownloadIcon />}
              onClick={downloadSampleTemplate}
            >
              Download Sample Template
            </Button>
          </div>

          <FileUpload
            id="excel-file-upload"
            value={file}
            filename={filename}
            filenamePlaceholder="Drag and drop a file or upload one"
            onFileInputChange={handleFileChange}
            onClearClick={handleClear}
            browseButtonText="Upload"
            accept=".xlsx,.xls"
            isLoading={isLoading}
          />

          {error && (
            <Alert
              variant="danger"
              title="Error"
              style={{ marginTop: '1rem' }}
            >
              {error}
            </Alert>
          )}

          {validationResult && !validationResult.valid && (
            <Alert
              variant="danger"
              title="Validation Errors"
              style={{ marginTop: '1rem' }}
            >
              <List>
                {validationResult.errors.map((err, idx) => (
                  <ListItem key={idx}>{err}</ListItem>
                ))}
              </List>
            </Alert>
          )}

          {validationResult && validationResult.warnings.length > 0 && (
            <Alert
              variant="warning"
              title="Warnings"
              style={{ marginTop: '1rem' }}
            >
              <List>
                {validationResult.warnings.map((warn, idx) => (
                  <ListItem key={idx}>{warn}</ListItem>
                ))}
              </List>
            </Alert>
          )}

          {parsedPlayers && validationResult?.valid && (
            <Alert
              variant="success"
              title={`Successfully parsed ${parsedPlayers.length} players`}
              style={{ marginTop: '1rem' }}
            >
              Click &quot;Import Players&quot; to add them to the tournament.
            </Alert>
          )}

          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <Button
              variant="secondary"
              icon={<UploadIcon />}
              onClick={handleParseFile}
              isDisabled={!file || isLoading}
            >
              {isLoading ? <Spinner size="md" /> : 'Parse File'}
            </Button>

            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              isDisabled={!parsedPlayers || !validationResult?.valid || isLoading}
            >
              Import Players
            </Button>
          </div>
        </CardBody>
      </Card>

      <Modal
        variant={ModalVariant.medium}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="confirm-import-modal-title"
        aria-describedby="confirm-import-modal-body"
      >
        <ModalHeader title="Confirm Player Import" labelId="confirm-import-modal-title" />
        <ModalBody id="confirm-import-modal-body">
          <p>You are about to import <strong>{parsedPlayers?.length}</strong> players into this tournament.</p>
          
          {validationResult?.warnings.length > 0 && (
            <Alert
              variant="warning"
              title="Some players have missing information"
              isInline
              style={{ marginTop: '1rem' }}
            >
              <List>
                {validationResult.warnings.slice(0, 5).map((warn, idx) => (
                  <ListItem key={idx}>{warn}</ListItem>
                ))}
                {validationResult.warnings.length > 5 && (
                  <ListItem>... and {validationResult.warnings.length - 5} more</ListItem>
                )}
              </List>
            </Alert>
          )}

          <p style={{ marginTop: '1rem' }}>Do you want to continue?</p>
        </ModalBody>
        <ModalFooter>
          <Button
            key="confirm"
            variant="primary"
            onClick={handleConfirmImport}
            isDisabled={isLoading}
          >
            {isLoading ? <Spinner size="md" /> : 'Confirm Import'}
          </Button>
          <Button key="cancel" variant="link" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default PlayerImport;

