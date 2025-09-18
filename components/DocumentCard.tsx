import React from 'react';
import { ScannedDocument, OcrStatus } from '../types';
import { DownloadIcon, CloseIcon, RetryIcon } from './icons';
import Spinner from './Spinner';

interface DocumentCardProps {
  document: ScannedDocument;
  onTextChange: (id: string, newText: string) => void;
  onDelete: (id: string) => void;
  onRetry: (id: string) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onTextChange, onDelete, onRetry }) => {

  const handleDownload = () => {
    const blob = new Blob([document.extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    // Fix: Use window.document to avoid conflict with the 'document' prop which is shadowing the global document object.
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `doc-${document.id}.txt`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderStatusOverlay = () => {
    switch (document.status) {
      case OcrStatus.PROCESSING:
        return (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center p-4">
            <Spinner className="w-10 h-10" />
            <p className="mt-2 text-center text-sm">Extracting text...</p>
          </div>
        );
      case OcrStatus.ERROR:
        return (
          <div className="absolute inset-0 bg-red-900 bg-opacity-80 flex flex-col items-center justify-center p-4">
            <p className="text-center font-semibold text-red-200">OCR Failed</p>
            <p className="text-center text-xs text-red-300 mt-1">{document.error}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div className="relative aspect-w-3 aspect-h-4 bg-slate-900 rounded-md overflow-hidden">
          <img src={document.imageSrc} alt={`Scanned document ${document.id}`} className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg text-cyan-400">Extracted Text</h3>
            <div className="flex items-center gap-2">
                <button
                  onClick={() => onRetry(document.id)}
                  disabled={document.status === OcrStatus.PROCESSING || document.status === OcrStatus.PENDING}
                  className="p-2 text-slate-400 hover:text-cyan-400 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
                  title="Retry OCR. This may improve accuracy."
                >
                    <RetryIcon className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleDownload}
                  disabled={document.status !== OcrStatus.SUCCESS}
                  className="p-2 text-slate-400 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
                  title="Download .txt"
                >
                    <DownloadIcon className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => onDelete(document.id)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Delete Document"
                >
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
          </div>
          <div className="relative flex-grow bg-slate-900 rounded-md p-1">
            <textarea
              value={document.extractedText}
              onChange={(e) => onTextChange(document.id, e.target.value)}
              placeholder="Text will appear here after processing..."
              className="w-full h-full min-h-[200px] bg-transparent border-0 text-slate-300 resize-none p-3 focus:ring-0"
              readOnly={document.status !== OcrStatus.SUCCESS}
            />
            {renderStatusOverlay()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;