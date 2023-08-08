export interface ConsensusState {
  synced: boolean
}

export interface User {
  consensusState?: ConsensusState
}
