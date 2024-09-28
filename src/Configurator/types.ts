export interface ConfigSelectionData {
  color?: string;
  seating?: string;
}

export interface handleconfig {
  color?: string;
  seating?: string;
}

export interface FetchDataResponse {
  seatingOptions: { value: string; title: string }[];
}
