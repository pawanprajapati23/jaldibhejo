import { env } from '@xenova/transformers';

// Configure environment for browser execution
env.allowLocalModels = false;
env.useBrowserCache = true;

// Optional: you can define a custom model path if you host them yourself
// env.remoteModelsPath = 'https://huggingface.co/';
