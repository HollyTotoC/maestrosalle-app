export type DispoPreference = 'journée' | 'demi' | 'aucune';
export type DispoRole = 'CDI' | 'extra';

export interface DispoShift {
  dispo: boolean;
  priorite: number; // 1, 2, 3 ou 0 pour flexible
}

export interface DispoDay {
  midi: DispoShift;
  soir: DispoShift;
}

export interface UserDispos {
  role: DispoRole;
  shiftsSouhaites: number;
  preference: DispoPreference;
  disponibilites: {
    [dateISO: string]: DispoDay;
  };
}
