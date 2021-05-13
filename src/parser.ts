import * as fs from 'fs'

export class Parser {
  inputArray: string[]
  currentLine: number

  constructor() {
    const input = fs.readFileSync('./input.play')
    this.inputArray = input.toString().split('\r\n') //input.split('\n')
    this.currentLine = 0
  }

  readline = () => this.inputArray[this.currentLine++]
}
