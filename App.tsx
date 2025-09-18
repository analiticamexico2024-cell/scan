import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ScannedDocument, OcrStatus } from './types';
import { extractTextFromImage } from './services/geminiService';
import FileUpload from './components/FileUpload';
import WebcamCapture from './components/WebcamCapture';
import DocumentCard from './components/DocumentCard';
import { CameraIcon, SearchIcon, UploadIcon } from './components/icons';

const App: React.FC = () => {
  const [documents, setDocuments] = useState<ScannedDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showWebcam, setShowWebcam] = useState(false);

  const processOcr = useCallback(async (doc: ScannedDocument) => {
    // Set status to processing
    setDocuments(prevDocs =>
      prevDocs.map(d => (d.id === doc.id ? { ...d, status: OcrStatus.PROCESSING } : d))
    );

    try {
      const base64Data = doc.imageSrc.split(',')[1];
      const extractedText = await extractTextFromImage(base64Data, doc.imageMimeType);
      
      // Check if the response indicates an error from the service itself
      if (extractedText.startsWith('Error processing document:') || extractedText.startsWith('An unknown error occurred')) {
          throw new Error(extractedText);
      }

      setDocuments(prevDocs =>
        prevDocs.map(d =>
          d.id === doc.id ? { ...d, extractedText, status: OcrStatus.SUCCESS } : d
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setDocuments(prevDocs =>
        prevDocs.map(d =>
          d.id === doc.id ? { ...d, status: OcrStatus.ERROR, error: errorMessage } : d
        )
      );
    }
  }, []);

  useEffect(() => {
    const pendingDocuments = documents.filter(d => d.status === OcrStatus.PENDING);
    pendingDocuments.forEach(processOcr);
  }, [documents, processOcr]);

  const handleFilesAdded = (files: { dataUrl: string; mimeType: string }[]) => {
    const newDocuments: ScannedDocument[] = files.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      imageSrc: file.dataUrl,
      imageMimeType: file.mimeType,
      extractedText: '',
      status: OcrStatus.PENDING,
    }));
    setDocuments(prevDocs => [...newDocuments, ...prevDocs]);
  };
  
  const handleCapture = (imageData: { dataUrl: string; mimeType: string }) => {
    handleFilesAdded([imageData]);
    setShowWebcam(false);
  };

  const handleTextChange = (id: string, newText: string) => {
    setDocuments(prevDocs =>
      prevDocs.map(d => (d.id === id ? { ...d, extractedText: newText } : d))
    );
  };

  const handleDelete = (id: string) => {
    setDocuments(prevDocs => prevDocs.filter(d => d.id !== id));
  };

  const handleRetryOcr = useCallback((id: string) => {
    setDocuments(prevDocs =>
      prevDocs.map(d =>
        d.id === id
          ? { ...d, status: OcrStatus.PENDING, extractedText: '', error: undefined }
          : d
      )
    );
  }, []);

  const filteredDocuments = useMemo(() => {
    if (!searchTerm) {
      return documents;
    }
    return documents.filter(doc =>
      doc.extractedText.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [documents, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      {showWebcam && <WebcamCapture onCapture={handleCapture} onClose={() => setShowWebcam(false)} />}
      
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Docu<span className="text-cyan-400">Scan</span> AI
          </h1>
          <p className="mt-2 text-lg text-slate-400 max-w-2xl mx-auto">
            Upload or snap a document, and let AI extract the text for you.
          </p>
        </header>

        <main>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-800/50 p-6 rounded-xl">
              <FileUpload onFilesAdded={handleFilesAdded} />
            </div>
            <div className="bg-slate-800/50 p-6 rounded-xl flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">Use Webcam</h2>
                <p className="text-slate-400 mb-6 text-center">Capture a document directly from your device's camera.</p>
                <button
                    onClick={() => setShowWebcam(true)}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg inline-flex items-center gap-2 transition-transform transform hover:scale-105"
                >
                    <CameraIcon className="w-6 h-6" />
                    Open Scanner
                </button>
            </div>
          </div>

          <div className="mt-12">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold">Your Documents ({filteredDocuments.length})</h2>
                <div className="relative w-full sm:w-auto">
                    <SearchIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                    <input 
                        type="text"
                        placeholder="Search in text..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 w-full sm:w-64 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                </div>
            </div>

            {documents.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-xl">
                    <UploadIcon className="w-16 h-16 mx-auto text-slate-600" />
                    <h3 className="mt-4 text-xl font-semibold text-slate-400">No documents yet</h3>
                    <p className="text-slate-500">Upload or scan a document to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredDocuments.map(doc => (
                        <DocumentCard 
                            key={doc.id} 
                            document={doc}
                            onTextChange={handleTextChange}
                            onDelete={handleDelete}
                            onRetry={handleRetryOcr}
                        />
                    ))}
                </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;