export type HostCityId =
  | "VANCOUVER"
  | "SEATTLE"
  | "SAN_FRANCISCO_BAY_AREA"
  | "LOS_ANGELES"
  | "GUADALAJARA"
  | "MEXICO_CITY"
  | "MONTERREY"
  | "HOUSTON"
  | "DALLAS"
  | "KANSAS_CITY"
  | "ATLANTA"
  | "MIAMI"
  | "TORONTO"
  | "BOSTON"
  | "PHILADELPHIA"
  | "NEW_YORK_NEW_JERSEY";

export type Stage =
  | "GROUP"
  | "ROUND_OF_32"
  | "ROUND_OF_16"
  | "QUARTER_FINAL"
  | "SEMI_FINAL"
  | "THIRD_PLACE"
  | "FINAL";

export type GroupId =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L";

export interface HostMatch {
  fifaMatchNumber: number;
  stage: Stage;
  group?: GroupId | null;
  homeTeamCode: string;
  awayTeamCode: string;
  homeTeamName: string;
  awayTeamName: string;
  kickoffLocal: string | null;
  kickoffUTC: string | null;
  stadiumGenericName: string;
  stadiumTraditionalName: string;
  city: string;
  country: "USA" | "MEX" | "CAN";
  timeZone: string;
}

export interface HostCity {
  id: HostCityId;
  label: string;
  country: "USA" | "MEX" | "CAN";
  stadiumGenericName: string;
  stadiumTraditionalName: string;
  capacity: number;
  timeZone: string;
  region: "WEST" | "CENTRAL" | "EAST";
  matches: HostMatch[];
}

export type HostCitiesById = Record<HostCityId, HostCity>;
