import * as XLSX from 'xlsx';

/**
 * Parse Excel file and extract player data
 * Expected columns: Name, Email, Phone, Team
 * @param {File} file - Excel file
 * @returns {Promise<Array>} Array of player objects
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Map to our player structure
        const players = jsonData.map((row, index) => ({
          name: row.Name || row.name || row.NAME || '',
          email: row.Email || row.email || row.EMAIL || '',
          phone: row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile || '',
          team_name: row.Team || row.team || row.TEAM || row['Team Name'] || row['team_name'] || '',
          row_number: index + 2, // +2 because Excel rows start at 1 and first row is header
        }));

        // Validate that we have the required data
        const validPlayers = players.filter(player => 
          player.name && player.team_name
        );

        if (validPlayers.length === 0) {
          reject(new Error('No valid player data found. Please ensure columns: Name, Team are present.'));
          return;
        }

        resolve(validPlayers);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Validate player data
 * @param {Array} players - Array of player objects
 * @returns {Object} Validation result with errors
 */
export const validatePlayers = (players) => {
  const errors = [];
  const warnings = [];

  if (!players || players.length === 0) {
    errors.push('No players provided');
    return { valid: false, errors, warnings };
  }

  players.forEach((player, index) => {
    if (!player.name || player.name.trim() === '') {
      errors.push(`Row ${player.row_number || index + 1}: Name is required`);
    }
    if (!player.team_name || player.team_name.trim() === '') {
      errors.push(`Row ${player.row_number || index + 1}: Team is required`);
    }
    if (!player.email || player.email.trim() === '') {
      warnings.push(`Row ${player.row_number || index + 1}: Email is missing`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Download sample Excel template
 */
export const downloadSampleTemplate = () => {
  const sampleData = [
    { Name: 'John Doe', Email: 'john@example.com', Phone: '1234567890', Team: 'Team A' },
    { Name: 'Jane Smith', Email: 'jane@example.com', Phone: '0987654321', Team: 'Team B' },
    { Name: 'Bob Wilson', Email: 'bob@example.com', Phone: '5555555555', Team: 'Team A' },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Players');

  // Generate and download
  XLSX.writeFile(workbook, 'player_template.xlsx');
};

