import { GroupId, Team } from './groups';

export type Stage = 'R32' | 'R16' | 'QF' | 'SF' | '3P' | 'F';

export interface KnockoutSlot {
  id: string; // e.g. "R32-1", "QF-3"
  stage: Stage;
  source: string; // e.g. "Group A winner", "Best 3rd place #4"
}

export interface KnockoutMatch {
  id: string;
  stage: Stage;
  home: KnockoutSlot;
  away: KnockoutSlot;
}

const pairing = (home: string, away: string, stage: Stage, index: number): KnockoutMatch => ({
  id: `${stage}-${index}`,
  stage,
  home: { id: `${stage}-${index}-H`, stage, source: home },
  away: { id: `${stage}-${index}-A`, stage, source: away },
});

const groupOrder: GroupId[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export const BRACKET_SLOTS: KnockoutMatch[] = [
  ...groupOrder.flatMap((group, idx) =>
    idx % 2 === 0
      ? [pairing(`Group ${group} winner`, `Group ${group} runner-up`, 'R32', idx + 1)]
      : [pairing(`Group ${group} runner-up`, `Group ${group} winner`, 'R32', idx + 1)],
  ),
  // Additional best third place play-ins
  pairing('Best 3rd place #1', 'Best 3rd place #8', 'R32', 13),
  pairing('Best 3rd place #2', 'Best 3rd place #7', 'R32', 14),
  pairing('Best 3rd place #3', 'Best 3rd place #6', 'R32', 15),
  pairing('Best 3rd place #4', 'Best 3rd place #5', 'R32', 16),
  // Round of 16
  pairing('Winner R32-1', 'Winner R32-2', 'R16', 1),
  pairing('Winner R32-3', 'Winner R32-4', 'R16', 2),
  pairing('Winner R32-5', 'Winner R32-6', 'R16', 3),
  pairing('Winner R32-7', 'Winner R32-8', 'R16', 4),
  pairing('Winner R32-9', 'Winner R32-10', 'R16', 5),
  pairing('Winner R32-11', 'Winner R32-12', 'R16', 6),
  pairing('Winner R32-13', 'Winner R32-14', 'R16', 7),
  pairing('Winner R32-15', 'Winner R32-16', 'R16', 8),
  // Quarterfinals
  pairing('Winner R16-1', 'Winner R16-2', 'QF', 1),
  pairing('Winner R16-3', 'Winner R16-4', 'QF', 2),
  pairing('Winner R16-5', 'Winner R16-6', 'QF', 3),
  pairing('Winner R16-7', 'Winner R16-8', 'QF', 4),
  // Semifinals
  pairing('Winner QF-1', 'Winner QF-2', 'SF', 1),
  pairing('Winner QF-3', 'Winner QF-4', 'SF', 2),
  // Third place & Final
  pairing('Loser SF-1', 'Loser SF-2', '3P', 1),
  pairing('Winner SF-1', 'Winner SF-2', 'F', 1),
];

export const teamMeta: Record<Team, { confed: string; flag: string }> = {
  Mexico: { confed: 'CONCACAF', flag: '🇲🇽' },
  'South Africa': { confed: 'CAF', flag: '🇿🇦' },
  'South Korea': { confed: 'AFC', flag: '🇰🇷' },
  'European Playoff D winner': { confed: 'UEFA', flag: '🏴?' },
  Canada: { confed: 'CONCACAF', flag: '🇨🇦' },
  'European Playoff A winner': { confed: 'UEFA', flag: '🇪🇺' },
  Qatar: { confed: 'AFC', flag: '🇶🇦' },
  Switzerland: { confed: 'UEFA', flag: '🇨🇭' },
  Brazil: { confed: 'CONMEBOL', flag: '🇧🇷' },
  Morocco: { confed: 'CAF', flag: '🇲🇦' },
  Haiti: { confed: 'CONCACAF', flag: '🇭🇹' },
  Scotland: { confed: 'UEFA', flag: '🏴' },
  'United States': { confed: 'CONCACAF', flag: '🇺🇸' },
  Paraguay: { confed: 'CONMEBOL', flag: '🇵🇾' },
  Australia: { confed: 'AFC', flag: '🇦🇺' },
  'European Playoff C winner': { confed: 'UEFA', flag: '🇪🇺' },
  Germany: { confed: 'UEFA', flag: '🇩🇪' },
  'Curaçao': { confed: 'CONCACAF', flag: '🇨🇼' },
  'Ivory Coast': { confed: 'CAF', flag: '🇨🇮' },
  Ecuador: { confed: 'CONMEBOL', flag: '🇪🇨' },
  Netherlands: { confed: 'UEFA', flag: '🇳🇱' },
  Japan: { confed: 'AFC', flag: '🇯🇵' },
  'European Playoff B winner': { confed: 'UEFA', flag: '🇪🇺' },
  Tunisia: { confed: 'CAF', flag: '🇹🇳' },
  Belgium: { confed: 'UEFA', flag: '🇧🇪' },
  Egypt: { confed: 'CAF', flag: '🇪🇬' },
  Iran: { confed: 'AFC', flag: '🇮🇷' },
  'New Zealand': { confed: 'OFC', flag: '🇳🇿' },
  Spain: { confed: 'UEFA', flag: '🇪🇸' },
  'Cape Verde': { confed: 'CAF', flag: '🇨🇻' },
  'Saudi Arabia': { confed: 'AFC', flag: '🇸🇦' },
  Uruguay: { confed: 'CONMEBOL', flag: '🇺🇾' },
  France: { confed: 'UEFA', flag: '🇫🇷' },
  Senegal: { confed: 'CAF', flag: '🇸🇳' },
  'Intercontinental Playoff 2 winner': { confed: 'Playoff', flag: '🌐' },
  Norway: { confed: 'UEFA', flag: '🇳🇴' },
  Argentina: { confed: 'CONMEBOL', flag: '🇦🇷' },
  Algeria: { confed: 'CAF', flag: '🇩🇿' },
  Austria: { confed: 'UEFA', flag: '🇦🇹' },
  Jordan: { confed: 'AFC', flag: '🇯🇴' },
  Portugal: { confed: 'UEFA', flag: '🇵🇹' },
  'Intercontinental Playoff 1 winner': { confed: 'Playoff', flag: '🌎' },
  Uzbekistan: { confed: 'AFC', flag: '🇺🇿' },
  Colombia: { confed: 'CONMEBOL', flag: '🇨🇴' },
  England: { confed: 'UEFA', flag: '🏴' },
  Croatia: { confed: 'UEFA', flag: '🇭🇷' },
  Ghana: { confed: 'CAF', flag: '🇬🇭' },
  Panama: { confed: 'CONCACAF', flag: '🇵🇦' },
};
