export type AvatarIdentity = {
  avatar_id: string;
  origin: string;
  face_shape: string;
  skin_tone: string;
  hair: string;
  gender_expression: string;
  age_range: string;
  facial_proportions: string;
  eye_shape: string;
  camera_framing: string;
  lighting_reference: string;
  identity_lock: boolean;
};

export type PresentationStyle = {
  style: string;
  gesture_intensity: string;
  head_movement_level: string;
  expression_range: string;
  energy_level: string;
};

export type VoiceParameters = {
  voice_type: string;
  speaking_speed: string;
  emotional_tone: string;
  emphasis_strength: string;
  pause_frequency: string;
  eye_contact_intensity: string;
  gesture_frequency: string;
  head_movement_level: string;
  expression_range: string;
  platform_intent: string;
};

export type Scene = {
  scene_id: number;
  scene_text: string;
};

export type AnimationMetadata = {
  facial_expression: string;
  eye_behavior: string;
  head_movement: string;
  gesture: string;
  breathing: string;
  pause_before: string;
  pause_after: string;
  emotion_intensity: number;
};

export type GeneratedPrompt = {
  scene_id: number;
  prompt_content: any;
};

export type ApiKey = {
  id: string;
  name: string;
  key: string;
  provider: string;
  enabled: boolean;
};

export type RenderStatus = 'pending' | 'rendering' | 'completed' | 'failed';

export type RenderedClip = {
  scene_id: number;
  url?: string;
  status: RenderStatus;
  error?: string;
  duration?: number;
  model?: string;
  provider?: string;
};

export type RenderSettings = {
  provider: 'official' | 'fal.ai' | 'kie.ai';
  mode: 'scene-by-scene' | 'batch';
  autoMerge: boolean;
};

export type AppState = {
  step: number;
  images: string[];
  avatarIdentity: AvatarIdentity | null;
  presentationStyle: PresentationStyle;
  voiceParameters: VoiceParameters;
  script: string;
  scenes: Scene[];
  targetModel: 'veo-3.1' | 'sora-2';
  prompts: GeneratedPrompt[];
  apiKeys: ApiKey[];
  renderSettings: RenderSettings;
  renderedClips: RenderedClip[];
  mergedVideoUrl?: string;
};
