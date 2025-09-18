
export enum OcrStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ScannedDocument {
  id: string;
  imageSrc: string; // data URL
  imageMimeType: string;
  extractedText: string;
  status: OcrStatus;
  error?: string;
}
