// @reference
// https://github.com/codemirror/CodeMirror/blob/f9c0e370ec4ddace08bb799965b3f46f9536a553/addon/runmode/runmode-standalone.js
// https://github.com/codemirror/codemirror.next/blob/master/legacy-modes/src/stringstream.ts

import StringStream from './StringStream'

export interface Mode<S = any, R = any> {
  startState: () => S
  execute: (stream: StringStream, state: S) => void
  endState: (state: S) => R
}

export default class StringParser {
  private source: string
  private mode: Mode

  constructor(source: string, mode: Mode) {
    this.source = source
    this.mode = mode
  }

  run() {
    const mode = this.mode
    const state = mode.startState()

    const lines = this.source.split(/\r\n/)

    for (let i = 0; i < lines.length; i++) {
      const stream = new StringStream(lines[i])

      while (!stream.eol()) {
        mode.execute(stream, state)
        stream.goAhead()
      }
    }

    return mode.endState(state)
  }
}
