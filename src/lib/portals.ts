export type PortalKey = 'williamsonhenry' | 'rightmove' | 'zoopla';

export interface PortalDefinition {
  key: PortalKey;
  label: string;
  ariaLabel: string;
}

export interface PortalEntry extends PortalDefinition {
  href: string;
}

const portalDefinitions: PortalDefinition[] = [
  {
    key: 'williamsonhenry',
    label: 'Williamson & Henry',
    ariaLabel: 'View on Williamson & Henry'
  },
  {
    key: 'rightmove',
    label: 'Rightmove',
    ariaLabel: 'View on Rightmove'
  },
  {
    key: 'zoopla',
    label: 'Zoopla',
    ariaLabel: 'View on Zoopla'
  }
];

type PortalRecord = Partial<Record<PortalKey, string | null | undefined>> | undefined | null;

function isValidHref(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return trimmed.length > 0;
}

export function getAvailablePortals(portals: PortalRecord): PortalEntry[] {
  if (!portals) return [];

  return portalDefinitions.flatMap((definition) => {
    const href = portals?.[definition.key];
    if (!isValidHref(href)) return [];
    const trimmedHref = href.trim();
    return [
      {
        ...definition,
        href: trimmedHref
      }
    ];
  });
}

export default portalDefinitions;
