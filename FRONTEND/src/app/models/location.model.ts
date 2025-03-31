export interface State {
    id: number;
    name: string;
  }
  
  export interface District {
    id: number;
    state_id: number;
    name: string;
  }
  
  export interface Block {
    id: number;
    district_id: number;
    name: string;
  }