export interface TeamResultsInteface {
    _id: null,
    total: number,
    wins: number,
    lose: number,
    tie: number,
    score: {
        goals: number,
        missedGoals: number,
    }
}
