/**
 * FIXED FIELD MAPPING COMPONENT
 * Properly handles all mapped fields including email, department, etc.
 * Saves mapping state to sessionStorage for use in generation
 */

import React, { useState, useEffect } from 'react';

const FieldMapping = ({ columns, onMappingComplete }) => {
  // Available certificate fields
  const certificateFields = [
    { key: 'name', label: 'Participant Name', required: true },
    { key: 'event_name', label: 'Event Name', required: false },
    { key: 'issue_date', label: 'Issue Date', required: false },
    { key: 'email', label: 'Email Address', required: false },
    { key: 'department', label: 'Department', required: false }
  ];
  
  // State: which fields are selected
  const [selectedFields, setSelectedFields] = useState({
    name: true, // Name is required by default
    event_name: false,
    issue_date: false,
    email: false,
    department: false
  });
  
  // State: mapping from certificate field to CSV column
  const [fieldMapping, setFieldMapping] = useState({
    name: '',
    event_name: '',
    issue_date: '',
    email: '',
    department: ''
  });
  
  // Load saved state from sessionStorage on mount
  useEffect(() => {
    const savedSelected = sessionStorage.getItem('selectedFields');
    const savedMapping = sessionStorage.getItem('fieldMapping');
    
    if (savedSelected) {
      try {
        setSelectedFields(JSON.parse(savedSelected));
      } catch (e) {
        console.error('Failed to parse savedSelected:', e);
      }
    }
    
    if (savedMapping) {
      try {
        setFieldMapping(JSON.parse(savedMapping));
      } catch (e) {
        console.error('Failed to parse savedMapping:', e);
      }
    }
  }, []);
  
  // Auto-map columns with matching names
  useEffect(() => {
    if (columns && columns.length > 0 && !fieldMapping.name) {
      const autoMapping = {};
      
      certificateFields.forEach(field => {
        // Try to find matching column (case-insensitive)
        const matchingColumn = columns.find(col => 
          col.toLowerCase() === field.key.toLowerCase() ||
          col.toLowerCase().replace(/_/g, ' ') === field.label.toLowerCase()
        );
        
        if (matchingColumn) {
          autoMapping[field.key] = matchingColumn;
          if (field.key !== 'name') {
            setSelectedFields(prev => ({ ...prev, [field.key]: true }));
          }
        }
      });
      
      setFieldMapping(prev => ({ ...prev, ...autoMapping }));
    }
  }, [columns]);
  
  // Toggle field selection
  const handleFieldToggle = (fieldKey) => {
    if (fieldKey === 'name') return; // Name is always required
    
    setSelectedFields(prev => {
      const newSelected = { ...prev, [fieldKey]: !prev[fieldKey] };
      sessionStorage.setItem('selectedFields', JSON.stringify(newSelected));
      return newSelected;
    });
  };
  
  // Update column mapping for a field
  const handleMappingChange = (fieldKey, columnName) => {
    setFieldMapping(prev => {
      const newMapping = { ...prev, [fieldKey]: columnName };
      sessionStorage.setItem('fieldMapping', JSON.stringify(newMapping));
      return newMapping;
    });
  };
  
  // Validate and proceed
  const handleContinue = () => {
    // Check that all selected fields have mappings
    const unmappedFields = Object.keys(selectedFields)
      .filter(key => selectedFields[key] && !fieldMapping[key]);
    
    if (unmappedFields.length > 0) {
      alert(`Please map the following fields: ${unmappedFields.join(', ')}`);
      return;
    }
    
    // Create final mapping object (only selected fields)
    const finalMapping = {};
    Object.keys(selectedFields).forEach(key => {
      if (selectedFields[key]) {
        finalMapping[key] = fieldMapping[key];
      }
    });
    
    // Save to sessionStorage
    sessionStorage.setItem('selectedFields', JSON.stringify(selectedFields));
    sessionStorage.setItem('fieldMapping', JSON.stringify(fieldMapping));
    sessionStorage.setItem('finalMapping', JSON.stringify(finalMapping));
    
    console.log('Field mapping saved:', { selectedFields, fieldMapping, finalMapping });
    
    // Notify parent component
    if (onMappingComplete) {
      onMappingComplete(finalMapping);
    }
  };
  
  return (
    <div className="field-mapping-container">
      <h2>Map Your Data Fields</h2>
      <p className="subtitle">Select which fields to include in certificates and map them to your CSV columns</p>
      
      <div className="mapping-grid">
        {certificateFields.map(field => (
          <div key={field.key} className="mapping-row">
            <div className="field-selector">
              <input
                type="checkbox"
                id={`select-${field.key}`}
                checked={selectedFields[field.key]}
                onChange={() => handleFieldToggle(field.key)}
                disabled={field.required}
              />
              <label htmlFor={`select-${field.key}`}>
                {field.label}
                {field.required && <span className="required">*</span>}
              </label>
            </div>
            
            {selectedFields[field.key] && (
              <div className="column-selector">
                <select
                  value={fieldMapping[field.key] || ''}
                  onChange={(e) => handleMappingChange(field.key, e.target.value)}
                  className="column-dropdown"
                >
                  <option value="">-- Select CSV Column --</option>
                  {columns && columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mapping-summary">
        <h3>Selected Fields Summary</h3>
        <ul>
          {Object.keys(selectedFields)
            .filter(key => selectedFields[key])
            .map(key => (
              <li key={key}>
                <strong>{certificateFields.find(f => f.key === key)?.label}:</strong>{' '}
                {fieldMapping[key] || <em>Not mapped</em>}
              </li>
            ))}
        </ul>
      </div>
      
      <button 
        className="continue-button"
        onClick={handleContinue}
      >
        Continue to Preview
      </button>
      
      <style jsx>{`
        .field-mapping-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        
        h2 {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #1a1a1a;
        }
        
        .subtitle {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 30px;
        }
        
        .mapping-grid {
          background: white;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .mapping-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .mapping-row:last-child {
          border-bottom: none;
        }
        
        .field-selector {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }
        
        .field-selector input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }
        
        .field-selector input[type="checkbox"]:disabled {
          cursor: not-allowed;
        }
        
        .field-selector label {
          font-size: 16px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
        }
        
        .required {
          color: #ef4444;
          margin-left: 4px;
        }
        
        .column-selector {
          flex: 1;
          max-width: 300px;
        }
        
        .column-dropdown {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          cursor: pointer;
        }
        
        .column-dropdown:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .mapping-summary {
          margin-top: 30px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        
        .mapping-summary h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #1a1a1a;
        }
        
        .mapping-summary ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .mapping-summary li {
          padding: 8px 0;
          font-size: 14px;
          color: #4b5563;
        }
        
        .mapping-summary strong {
          color: #1a1a1a;
        }
        
        .mapping-summary em {
          color: #ef4444;
        }
        
        .continue-button {
          width: 100%;
          margin-top: 24px;
          padding: 14px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 16px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .continue-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .continue-button:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default FieldMapping;
