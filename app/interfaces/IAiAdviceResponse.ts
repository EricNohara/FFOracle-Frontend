// response from ai advice generation
export interface IAiAdviceResponse {
  position: string;
  playerId: string;
  picked: boolean;
  reasoning: string;
}
