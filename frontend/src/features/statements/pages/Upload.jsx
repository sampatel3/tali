import React, { useState } from 'react';
import { uploadAPI } from '../../../shared/services/api';
import toast from 'react-hot-toast';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const { data } = await uploadAPI.uploadStatement(file);
      toast.success('Statement uploaded successfully! Processing...');
      
      // Poll for processing status
      const statementId = data.statement.id;
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max wait
      
      const checkStatus = setInterval(async () => {
        attempts++;
        try {
          const statusData = await uploadAPI.getStatementStatus(statementId);
          
          if (statusData.status === 'completed') {
            clearInterval(checkStatus);
            toast.success(`Processing complete! ${statusData.transactionCount || 0} transactions extracted.`);
            setFile(null);
            setUploading(false);
            // Optionally refresh transactions list
            window.location.reload();
          } else if (statusData.status === 'failed') {
            clearInterval(checkStatus);
            toast.error(`Processing failed: ${statusData.errorMessage || 'Unknown error'}`);
            setUploading(false);
          } else if (attempts >= maxAttempts) {
            clearInterval(checkStatus);
            toast.warning('Processing is taking longer than expected. Check back later.');
            setUploading(false);
          }
        } catch (err) {
          console.error('Error checking status:', err);
          if (attempts >= maxAttempts) {
            clearInterval(checkStatus);
            setUploading(false);
          }
        }
      }, 1000); // Check every second
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Upload failed. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Upload Bank Statement</h1>

      <div className="card max-w-2xl">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-semibold mb-2">Upload Bank Statement</h3>
          <p className="text-gray-600 mb-4">
            Supported formats: PDF, CSV (Max 10MB)
          </p>

          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.csv"
            className="hidden"
            id="file-upload"
          />

          <label htmlFor="file-upload" className="btn-secondary cursor-pointer inline-block">
            Choose File
          </label>

          {file && (
            <div className="mt-4">
              <p className="text-sm text-gray-700">Selected: {file.name}</p>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="btn-primary mt-2"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <h4 className="font-semibold mb-2">How it works:</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li>Download your bank statement (PDF or CSV)</li>
            <li>Upload it securely to TALI</li>
            <li>We'll automatically extract transactions</li>
            <li>Detect subscriptions and categorize spending</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Upload;
