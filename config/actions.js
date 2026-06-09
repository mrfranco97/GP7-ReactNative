const ACTION_META = {
  hello: { label: 'Saludar', icon: 'hand-right' },
  stretch: { label: 'Estirarse', icon: 'body' },
  dance1: { label: 'Baile 1', icon: 'musical-notes' },
  dance2: { label: 'Baile 2', icon: 'musical-note' },
  heart: { label: 'Corazón', icon: 'heart' },
  flips: { label: 'Pirueta', icon: 'sync' },
  balance_stand: { label: 'Postura de equilibrio', icon: 'scale' },
  recovery_stand: { label: 'Recuperar postura', icon: 'refresh-circle' },

  wave_hand: { label: 'Saludar con la mano', icon: 'hand-right' },
  wave_hand_turn: { label: 'Saludar y girar', icon: 'sync-circle' },
  shake_hand: { label: 'Estrechar la mano', icon: 'people' },
  high_stand: { label: 'Postura alta', icon: 'arrow-up-circle' },
  low_stand: { label: 'Postura baja', icon: 'arrow-down-circle' },

  release_arm: { label: 'Soltar brazo', icon: 'hand-left' },
  shake_hand_arm: { label: 'Estrechar mano (brazo)', icon: 'people-circle' },
  high_five: { label: 'Chocar los cinco', icon: 'hand-right' },
  hug: { label: 'Abrazar', icon: 'heart-circle' },
  clap: { label: 'Aplaudir', icon: 'happy' },
};

const FALLBACK_ICON = 'flash';

function prettify(name) {
  const spaced = String(name).replace(/[_-]+/g, ' ').trim();
  if (!spaced) return name;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function getActionMeta(name) {
  const meta = ACTION_META[name];
  if (meta) return meta;
  return { label: prettify(name), icon: FALLBACK_ICON };
}

const LABEL_TO_ICON = Object.fromEntries(
  Object.values(ACTION_META).map(({ label, icon }) => [label, icon]),
);

export function getActionIconByLabel(label) {
  return LABEL_TO_ICON[label] ?? FALLBACK_ICON;
}
