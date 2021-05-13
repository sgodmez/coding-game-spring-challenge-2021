import { Parser } from './parser'

const PARSER = new Parser()
const DEBUG = false

const parseline = () => {
  const input = PARSER.readline()
  if (DEBUG) console.error(input)
  return input
}

class Cell {
  index: number
  richness: number
  neighbors: [number, number, number, number, number, number]

  constructor(
    index: number,
    richness: number,
    neighbors: [number, number, number, number, number, number]
  ) {
    this.index = index
    this.richness = richness
    this.neighbors = neighbors
  }
}

class Tree {
  constructor(
    public cellIndex: number,
    public size: number,
    private isMine: boolean,
    private isDormant: boolean,
    private cell: Cell
  ) {}
}

const WAIT = 'WAIT'
const SEED = 'SEED'
const GROW = 'GROW'
const COMPLETE = 'COMPLETE'

type ACTION_TYPES = typeof WAIT | typeof SEED | typeof GROW | typeof COMPLETE

class Action {
  constructor(type: typeof WAIT, profit: number, loss: number)

  constructor(
    type: typeof SEED,
    profit: number,
    loss: number,
    targetCellIdx: number,
    sourceCellIdx: number
  )

  constructor(
    type: typeof GROW | typeof COMPLETE,
    profit: number,
    loss: number,
    targetCellIdx: number
  )

  constructor(
    type: string,
    profit: number,
    loss: number,
    targetCellIdx?: number,
    sourceCellIdx?: number
  )

  constructor(
    public type: ACTION_TYPES,
    public loss: number,
    public targetCellIdx?: number,
    private sourceCellIdx?: number
  ) {}

  static parse(line: string, game: Game): Action {
    const parts = line.split(' ')

    switch (parts[0]) {
      case WAIT:
        return new Action(WAIT, 0, 0)

      case SEED: {
        const sourceIdx = parseInt(parts[1])
        const tree = game.myTrees.find(t => t.cellIndex === sourceIdx)
        let loss
        let profit
        if (!tree) {
          profit = 0
          loss = game.myTrees.filter(t => t.size === 0).length
        } else {
          profit = 0
          loss = game.myTrees.filter(t => t.size === 0).length + tree.size
        }
        return new Action(SEED, profit, loss, parseInt(parts[2]), sourceIdx)
      }
      case GROW: {
        const sourceIdx = parseInt(parts[1])
        const tree = game.myTrees.find(t => t.cellIndex === sourceIdx)
        let loss
        let profit
        if (!tree) {
          loss = 999999
          profit = 0
        } else {
          loss =
            (tree.size === 0 ? 1 : 3) +
            game.myTrees.filter(t => t.size === tree.size + 1).length
          profit = 1
        }
        return new Action(GROW, profit, loss, parseInt(parts[2]), sourceIdx)
      }
      case COMPLETE: {
        return new Action(COMPLETE, 0, parseInt(parts[1]))
      }
      default:
        return new Action(parts[0], 0, 99999999, parseInt(parts[1]))
    }
  }

  toString() {
    if (this.type === WAIT) {
      return WAIT
    }

    if (this.type === SEED) {
      return `${SEED} ${this.sourceCellIdx} ${this.targetCellIdx}`
    }

    return `${this.type} ${this.targetCellIdx}`
  }
}

class Game {
  round: number
  nutrients: number
  cells: Cell[]
  possibleActions: Action[]
  trees: Tree[]
  myTrees: Tree[]
  mySun: number
  myScore: number
  opponentsSun: number
  opponentScore: number
  opponentIsWaiting: boolean

  day: number
  opponentSun: number

  constructor() {
    this.round = 0
    this.nutrients = 0
    this.cells = []
    this.possibleActions = []
    this.trees = []
    this.myTrees = []
    this.mySun = 0
    this.myScore = 0
    this.opponentsSun = 0
    this.opponentScore = 0
    this.opponentIsWaiting = false
    this.day = 0
    this.opponentSun = 0
  }

  getNextAction() {
    let myAction = this.possibleActions[0]
    const cells: Cell[] = []
    for (const action of this.possibleActions) {
      if (
        (action.type === 'COMPLETE' || action.type === 'GROW') &&
        action.targetCellIdx
      ) {
        cells.push(game.cells[action.targetCellIdx])
      }
    }
    if (cells.length > 0) {
      cells.sort((a, b) => b.richness - a.richness)
      return this.possibleActions.filter(a => a.targetCellIdx === cells[0].index)[0]
    }
    return myAction
  }
}

const game = new Game()

const numberOfCells = parseInt(parseline())

for (let i = 0; i < numberOfCells; i++) {
  const inputs = parseline().split(' ')
  const index = parseInt(inputs[0])
  const richness = parseInt(inputs[1])
  const neigh0 = parseInt(inputs[2])
  const neigh1 = parseInt(inputs[3])
  const neigh2 = parseInt(inputs[4])
  const neigh3 = parseInt(inputs[5])
  const neigh4 = parseInt(inputs[6])
  const neigh5 = parseInt(inputs[7])

  game.cells.push(
    new Cell(index, richness, [neigh0, neigh1, neigh2, neigh3, neigh4, neigh5])
  )
}

// eslint-disable-next-line no-constant-condition
while (true) {
  game.day = parseInt(parseline())
  game.nutrients = parseInt(parseline())
  let inputs = parseline().split(' ')
  game.mySun = parseInt(inputs[0])
  game.myScore = parseInt(inputs[1])
  inputs = parseline().split(' ')
  game.opponentSun = parseInt(inputs[0])
  game.opponentScore = parseInt(inputs[1])
  game.opponentIsWaiting = inputs[2] !== '0'
  game.trees = []
  game.myTrees = []

  const numberOfTrees = parseInt(parseline())

  for (let i = 0; i < numberOfTrees; i++) {
    inputs = parseline().split(' ')
    const cellIndex = parseInt(inputs[0])
    const size = parseInt(inputs[1])
    const isMine = inputs[2] !== '0'
    const isDormant = inputs[3] !== '0'
    const cell = game.cells[cellIndex]
    game.trees.push(new Tree(cellIndex, size, isMine, isDormant, cell))
    if (isMine) game.myTrees.push(new Tree(cellIndex, size, isMine, isDormant, cell))
  }

  game.possibleActions = []
  const numberOfPossibleAction = parseInt(parseline())

  for (let i = 0; i < numberOfPossibleAction; i++) {
    const possibleAction = parseline()
    game.possibleActions.push(Action.parse(possibleAction, game))
  }

  const action = game.getNextAction()

  console.log(action.toString())
}
