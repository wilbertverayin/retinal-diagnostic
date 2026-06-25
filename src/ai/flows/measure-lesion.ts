// AI features disabled for static build

export interface MeasureLesionInput {
  photoDataUri: string;
  lesionType: string;
}

export interface MeasureLesionOutput {
  heightMicrons: number;
  widthMicrons: number;
  areaMicronsSquared: number;
}

export async function measureLesion(input: MeasureLesionInput): Promise<MeasureLesionOutput> {
  return {
    heightMicrons: 0,
    widthMicrons: 0,
    areaMicronsSquared: 0,
  };
}
