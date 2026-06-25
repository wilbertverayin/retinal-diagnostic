// AI features disabled for static build

export interface GenerateReportInput {
  photoDataUri: string;
}

export interface GenerateReportOutput {
  interpretation: {
    normalRetinalArchitecture: string;
    fovealContour: string;
    rpe: string;
    outerRetinalLayers: string;
    choroid: string;
  };
  summary: string;
}

export async function generateReport(input: GenerateReportInput): Promise<GenerateReportOutput> {
  return {
    interpretation: {
      normalRetinalArchitecture: 'AI features are not available in the static demo.',
      fovealContour: '',
      rpe: '',
      outerRetinalLayers: '',
      choroid: '',
    },
    summary: 'AI features are not available in the static demo.',
  };
}
