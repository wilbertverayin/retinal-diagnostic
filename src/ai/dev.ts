import { config } from 'dotenv';
config();

import '@/ai/flows/detect-lesions.ts';
import '@/ai/flows/diagnose-image.ts';
import '@/ai/flows/generate-report.ts';
import '@/ai/flows/measure-lesion.ts';
