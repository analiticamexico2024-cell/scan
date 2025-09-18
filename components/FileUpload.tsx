
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons';

interface FileUploadProps {
  onFilesAdded: (files: { dataUrl: string; mimeType: string }[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesAdded }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if(imageFiles.length === 0) return;

    const filePromises = imageFiles.map(file => {
      return new Promise<{ dataUrl: string; mimeType: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && typeof e.target.result === 'string') {
            resolve({ dataUrl: e.target.result, mimeType: file.type });
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then(onFilesAdded).catch(console.error);
  }, [onFilesAdded]);

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <div
      className={`border-4 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
        isDragging ? 'border-cyan-400 bg-slate-700' : 'border-slate-600 hover:border-cyan-500 hover:bg-slate-800'
      }`}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <input
        id="file-upload"
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
        <UploadIcon className="w-12 h-12 text-slate-400 mb-4" />
        <p className="text-xl font-semibold">Drag & drop documents here</p>
        <p className="text-slate-400">or click to select files</p>
        <p className="text-sm text-slate-500 mt-2">(Supports multiple image files)</p>
      </label>
    </div>
  );
};

export default FileUpload;
