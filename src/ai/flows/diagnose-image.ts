// AI features disabled for static build

export interface DiagnoseImageInput {
  photoDataUri: string;
}

export interface DiagnoseImageOutput {
  summary: string;
  lesions: Array<{ name: string; present: boolean; confidence: number }>;
  classification: string;
  referralUrgency: number;
}

export async function diagnoseImage(input: DiagnoseImageInput): Promise<DiagnoseImageOutput> {
  return {
    summary: 'AI features are not available in the static demo.',
    lesions: [],
    classification: 'N/A',
    referralUrgency: 0,
  };
}
