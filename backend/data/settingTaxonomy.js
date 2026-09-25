export const SETTINGS = ['Urban', 'Nature', 'Indoor', 'Night', 'Daylight', 'Abstract']

export const SETTING_DEFINITIONS = {
  Urban: 'Cityscapes, streets, architecture, traffic, concrete, skylines.',
  Nature: 'Landscapes, forests, mountains, beaches, plants, open skies.',
  Indoor: 'Rooms, cafes, studios, domestic spaces, furniture, interiors.',
  Night: 'Dark scenes, neon lights, stars, low-light, city lights, shadows.',
  Daylight: 'Bright, sunny, high-key lighting, clear skies, harsh shadows.',
  Abstract: 'Close-ups, textures, macro shots, non-representational, blur.',
}

export function getSettingPrompt() {
  const lines = Object.entries(SETTING_DEFINITIONS).map(([tag, def]) => `${tag}: ${def}`)
  return `Select exactly ONE setting from this controlled list:\n${lines.join('\n')}\n\nRespond with the setting name only.`
}