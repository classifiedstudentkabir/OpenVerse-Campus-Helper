/**
 * FIXED CERTIFICATE PREVIEW COMPONENT
 * Shows only the fields that user has actually mapped
 * Reads mapping from sessionStorage
 * Displays sample data for preview
 */

import React, { useState, useEffect } from 'react';

const CertificatePreview = ({ sampleData }) => {
  const [selectedFields, setSelectedFields] = useState({});
  const [fieldMapping, setFieldMapping] = useState({});
  const [previewData, setPreviewData] = useState({});
  
  // Load mapping from sessionStorage
  useEffect(() => {
    const savedSelected = sessionStorage.getItem('selectedFields');
    const savedMapping = sessionStorage.getItem('fieldMapping');
    
    if (savedSelected) {
      try {
        setSelectedFields(JSON.parse(savedSelected));
      } catch (e) {
        console.error('Failed to parse selectedFields:', e);
      }
    }
    
    if (savedMapping) {
      try {
        const mapping = JSON.parse(savedMapping);
        setFieldMapping(mapping);
        
        // Map sample data using field mapping
        if (sampleData) {
          const mapped = {};
          Object.keys(mapping).forEach(certField => {
            const csvColumn = mapping[certField];
            if (csvColumn && sampleData[csvColumn]) {
              mapped[certField] = sampleData[csvColumn];
            }
          });
          setPreviewData(mapped);
        }
      } catch (e) {
        console.error('Failed to parse fieldMapping:', e);
      }
    }
  }, [sampleData]);
  
  // Get list of fields that should be displayed
  const getDisplayFields = () => {
    return Object.keys(selectedFields)
      .filter(key => selectedFields[key] && previewData[key]);
  };
  
  const displayFields = getDisplayFields();
  
  return (
    <div className="preview-container">
      <div className="preview-header">
        <h2>Certificate Preview</h2>
        <p className="preview-subtitle">
          This is how your certificate will look with the mapped fields
        </p>
      </div>
      
      {/* Preview Summary */}
      <div className="preview-summary">
        <h3>Mapped Fields:</h3>
        <div className="field-tags">
          {displayFields.length > 0 ? (
            displayFields.map(field => (
              <span key={field} className="field-tag">
                {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))
          ) : (
            <span className="no-fields">No fields mapped yet</span>
          )}
        </div>
      </div>
      
      {/* Certificate Preview */}
      <div className="certificate-preview">
        <div className="certificate-background">
          <div className="certificate-border">
            <div className="certificate-content">
              {/* Title - always shown */}
              <div className="certificate-title">
                CERTIFICATE OF ACHIEVEMENT
              </div>
              
              {/* Name - if mapped */}
              {selectedFields.name && previewData.name && (
                <div className="certificate-name">
                  {previewData.name}
                </div>
              )}
              
              {/* Event name - if mapped */}
              {selectedFields.event_name && previewData.event_name && (
                <>
                  <div className="certificate-subtitle">
                    For participating in
                  </div>
                  <div className="certificate-event">
                    {previewData.event_name}
                  </div>
                </>
              )}
              
              {/* Issue date - if mapped */}
              {selectedFields.issue_date && previewData.issue_date && (
                <div className="certificate-date">
                  Date: {previewData.issue_date}
                </div>
              )}
              
              {/* Email - if mapped */}
              {selectedFields.email && previewData.email && (
                <div className="certificate-email">
                  {previewData.email}
                </div>
              )}
              
              {/* Department - if mapped */}
              {selectedFields.department && previewData.department && (
                <div className="certificate-department">
                  Department: {previewData.department}
                </div>
              )}
              
              {/* Certificate ID - always shown */}
              <div className="certificate-id">
                CERT-001
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Field Details */}
      <div className="field-details">
        <h3>Field Values (from first row):</h3>
        <table>
          <tbody>
            {displayFields.map(field => (
              <tr key={field}>
                <td className="field-name">
                  {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                </td>
                <td className="field-value">
                  {previewData[field] || <em>No data</em>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <style jsx>{`
        .preview-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        
        .preview-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .preview-header h2 {
          font-size: 28px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 8px;
        }
        
        .preview-subtitle {
          font-size: 16px;
          color: #6b7280;
        }
        
        .preview-summary {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
        }
        
        .preview-summary h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 12px;
        }
        
        .field-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .field-tag {
          display: inline-block;
          padding: 6px 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .no-fields {
          color: #9ca3af;
          font-style: italic;
        }
        
        .certificate-preview {
          margin-bottom: 30px;
          display: flex;
          justify-content: center;
        }
        
        .certificate-background {
          width: 800px;
          height: 600px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          position: relative;
        }
        
        .certificate-border {
          width: 100%;
          height: 100%;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .certificate-content {
          text-align: center;
          color: white;
          padding: 40px;
          position: relative;
          width: 100%;
        }
        
        .certificate-title {
          font-size: 36px;
          font-weight: bold;
          margin-bottom: 30px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .certificate-name {
          font-size: 32px;
          font-weight: 600;
          margin: 30px 0;
          color: #fef3c7;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .certificate-subtitle {
          font-size: 20px;
          margin: 15px 0 10px 0;
          opacity: 0.9;
        }
        
        .certificate-event {
          font-size: 24px;
          font-weight: 600;
          margin: 10px 0 20px 0;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
        }
        
        .certificate-date {
          font-size: 18px;
          margin: 20px 0 10px 0;
          opacity: 0.85;
        }
        
        .certificate-email {
          font-size: 16px;
          margin: 10px 0;
          opacity: 0.85;
        }
        
        .certificate-department {
          font-size: 16px;
          margin: 10px 0;
          opacity: 0.85;
        }
        
        .certificate-id {
          position: absolute;
          bottom: 20px;
          right: 30px;
          font-size: 12px;
          opacity: 0.7;
        }
        
        .field-details {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .field-details h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 16px;
        }
        
        .field-details table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .field-details tr {
          border-bottom: 1px solid #e5e7eb;
        }
        
        .field-details tr:last-child {
          border-bottom: none;
        }
        
        .field-details td {
          padding: 12px 8px;
        }
        
        .field-name {
          font-weight: 600;
          color: #374151;
          width: 200px;
        }
        
        .field-value {
          color: #6b7280;
        }
        
        .field-value em {
          color: #9ca3af;
        }
        
        @media (max-width: 900px) {
          .certificate-background {
            width: 100%;
            height: auto;
            aspect-ratio: 4/3;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificatePreview;
