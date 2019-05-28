import { Mode } from '../StringParser'
import StringStream from './../StringStream'

interface Node {
  type: string
}

interface State {
  stack: any[]
  root: any
}

function handleHeader(stream: StringStream, state: State) {
  const match = stream.match(/^(#+)\s*(.*)/, true)!

  const level = match[1].length
  const content = match[2].trim()

  const node = {
    level,
    content,
    type: 'HEADER',
    children: []
  }

  const stack = state.stack

  while (stack.length > 1 && stack[0].level >= level) {
    stack.shift()
  }

  stack[0].children.push(node)
  stack.unshift(node)
}

function handleList(stream: StringStream, state: State) {}

const markdown: Mode<State> = {
  startState() {
    const root = {
      type: 'ROOT',
      children: []
    }

    return {
      stack: [root],
      root
    }
  },
  endState(state) {
    return state.root
  },
  execute(stream, state) {
    const ch = stream.peek()
    console.log('ch', ch)

    if (ch === '#') {
      handleHeader(stream, state)
    } else if (ch === '-') {
      handleList(stream, state)
    } else {
      stream.eatWhile(/[^\r\n]/)
    }
  }
}

export default markdown
