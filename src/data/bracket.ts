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

const pairing = (home: string, away: string, stage: Stage, matchNumber: number): KnockoutMatch => {
  const id = `${stage}-${matchNumber}`;
  return {
    id,
    stage,
    home: { id: `${id}-H`, stage, source: home },
    away: { id: `${id}-A`, stage, source: away },
  };
};

export const BRACKET_SLOTS: KnockoutMatch[] = [
  // Round of 32 (Match 73-88)
  pairing('Group A runner-up', 'Group B runner-up', 'R32', 73),
  pairing('Group E winner', 'Group A/B/C/D/F third place', 'R32', 74),
  pairing('Group F winner', 'Group C runner-up', 'R32', 75),
  pairing('Group C winner', 'Group F runner-up', 'R32', 76),
  pairing('Group I winner', 'Group C/D/F/G/H third place', 'R32', 77),
  pairing('Group E runner-up', 'Group I runner-up', 'R32', 78),
  pairing('Group A winner', 'Group C/E/F/H/I third place', 'R32', 79),
  pairing('Group L winner', 'Group E/H/I/J/K third place', 'R32', 80),
  pairing('Group D winner', 'Group B/E/F/I/J third place', 'R32', 81),
  pairing('Group G winner', 'Group A/E/H/I/J third place', 'R32', 82),
  pairing('Group K runner-up', 'Group L runner-up', 'R32', 83),
  pairing('Group H winner', 'Group J runner-up', 'R32', 84),
  pairing('Group B winner', 'Group E/F/G/I/J third place', 'R32', 85),
  pairing('Group J winner', 'Group H runner-up', 'R32', 86),
  pairing('Group K winner', 'Group D/E/I/J/L third place', 'R32', 87),
  pairing('Group D runner-up', 'Group G runner-up', 'R32', 88),
  // Round of 16 (Match 89-96)
  pairing('Winner R32-74', 'Winner R32-77', 'R16', 89),
  pairing('Winner R32-73', 'Winner R32-75', 'R16', 90),
  pairing('Winner R32-76', 'Winner R32-78', 'R16', 91),
  pairing('Winner R32-79', 'Winner R32-80', 'R16', 92),
  pairing('Winner R32-83', 'Winner R32-84', 'R16', 93),
  pairing('Winner R32-81', 'Winner R32-82', 'R16', 94),
  pairing('Winner R32-86', 'Winner R32-88', 'R16', 95),
  pairing('Winner R32-85', 'Winner R32-87', 'R16', 96),
  // Quarterfinals (Match 97-100)
  pairing('Winner R16-89', 'Winner R16-90', 'QF', 97),
  pairing('Winner R16-93', 'Winner R16-94', 'QF', 98),
  pairing('Winner R16-91', 'Winner R16-92', 'QF', 99),
  pairing('Winner R16-95', 'Winner R16-96', 'QF', 100),
  // Semifinals (Match 101-102)
  pairing('Winner QF-97', 'Winner QF-98', 'SF', 101),
  pairing('Winner QF-99', 'Winner QF-100', 'SF', 102),
  // Third place & Final (Match 103-104)
  pairing('Loser SF-101', 'Loser SF-102', '3P', 103),
  pairing('Winner SF-101', 'Winner SF-102', 'F', 104),
];

export const teamMeta: Record<Team, { confed: string; flag: string }> = {
  Mexico: { confed: 'CONCACAF', flag: '🇲🇽' },
  'South Africa': { confed: 'CAF', flag: '🇿🇦' },
  'South Korea': { confed: 'AFC', flag: '🇰🇷' },
  'Denmark/North Macedonia/Czechia/Republic of Ireland': { confed: 'UEFA', flag: '🇪🇺' },
  Canada: { confed: 'CONCACAF', flag: '🇨🇦' },
  'Italy/Northern Ireland/Wales/Bosnia and Herzegovina': { confed: 'UEFA', flag: '🇪🇺' },
  Qatar: { confed: 'AFC', flag: '🇶🇦' },
  Switzerland: { confed: 'UEFA', flag: '🇨🇭' },
  Brazil: { confed: 'CONMEBOL', flag: '🇧🇷' },
  Morocco: { confed: 'CAF', flag: '🇲🇦' },
  Haiti: { confed: 'CONCACAF', flag: '🇭🇹' },
  Scotland: { confed: 'UEFA', flag: '🏴' },
  'United States': { confed: 'CONCACAF', flag: '🇺🇸' },
  Paraguay: { confed: 'CONMEBOL', flag: '🇵🇾' },
  Australia: { confed: 'AFC', flag: '🇦🇺' },
  'Turkey/Romania/Slovakia/Kosovo': { confed: 'UEFA', flag: '🇪🇺' },
  Germany: { confed: 'UEFA', flag: '🇩🇪' },
  'Curaçao': { confed: 'CONCACAF', flag: '🇨🇼' },
  'Ivory Coast': { confed: 'CAF', flag: '🇨🇮' },
  Ecuador: { confed: 'CONMEBOL', flag: '🇪🇨' },
  Netherlands: { confed: 'UEFA', flag: '🇳🇱' },
  Japan: { confed: 'AFC', flag: '🇯🇵' },
  'Ukraine/Sweden/Poland/Albania': { confed: 'UEFA', flag: '🇪🇺' },
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
  'Bolivia/Suriname/Iraq': { confed: 'Playoff', flag: '🌐' },
  Norway: { confed: 'UEFA', flag: '🇳🇴' },
  Argentina: { confed: 'CONMEBOL', flag: '🇦🇷' },
  Algeria: { confed: 'CAF', flag: '🇩🇿' },
  Austria: { confed: 'UEFA', flag: '🇦🇹' },
  Jordan: { confed: 'AFC', flag: '🇯🇴' },
  Portugal: { confed: 'UEFA', flag: '🇵🇹' },
  'New Caledonia/Jamaica/DR Congo': { confed: 'Playoff', flag: '🌎' },
  Uzbekistan: { confed: 'AFC', flag: '🇺🇿' },
  Colombia: { confed: 'CONMEBOL', flag: '🇨🇴' },
  England: { confed: 'UEFA', flag: '🏴' },
  Croatia: { confed: 'UEFA', flag: '🇭🇷' },
  Ghana: { confed: 'CAF', flag: '🇬🇭' },
  Panama: { confed: 'CONCACAF', flag: '🇵🇦' },
};
