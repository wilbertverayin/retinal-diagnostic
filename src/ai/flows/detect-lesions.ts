// AI features disabled for static build

export interface DetectLesionsInput {
  photoDataUri: string;
  lesionToHighlight: string;
}

export interface DetectLesionsOutput {
  annotatedImage: string;
}

export async function detectLesions(input: DetectLesionsInput): Promise<DetectLesionsOutput> {
  return {
    annotatedImage: input.photoDataUri,
  };
}
