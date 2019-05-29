import { Mode } from '../StringParser'
import StringStream from './../StringStream'

interface Node {
  type: string
  indent: number
  content: string
}

interface BlockNode extends Node {
  level: number
  children: Node[]
}

interface State {
  stack: BlockNode[]
  root: BlockNode
}

function handleHeader(stream: StringStream, state: State, indent: number) {
  const stack = state.stack
  const match = stream.match(/^(#+)\s*(.*)/, true)!

  const level = match[1].length
  const content = match[2].trim()

  while (stack.length > 1 && (stack[0].level >= level || stack[0].type !== 'HEADER')) {
    stack.shift()
  }

  const node = {
    type: 'HEADER',
    level,
    indent,
    content,
    children: []
  }

  stack[0].children.push(node)
  stack.unshift(node)
}

function handleList(stream: StringStream, state: State, indent: number) {
  const stack = state.stack
  const match = stream.match(/^-\s*(.*)/, true)!

  const level = indent
  const content = match[1].trim()

  const node = {
    type: 'LIST',
    level,
    indent,
    content,
    children: []
  }

  while (stack.length > 1 && stack[0].type === 'LIST' && stack[0].indent >= indent) {
    stack.shift()
  }

  stack[0].children.push(node)
  stack.unshift(node)
}

function handleCodeHeader(stream: StringStream, state: State, indent: number) {
  const stack = state.stack
  const match = stream.match(/^```(.*)/, true)!

  const level = indent
  const content = match[1].trim()

  const node = {
    type: 'CODE',
    level,
    indent,
    content,
    children: []
  }

  while (stack.length > 1 && stack[0].indent >= indent) {
    stack.shift()
  }

  stack[0].children.push(node)
  stack.unshift(node)
}

function handleCodeContent(stream: StringStream, state: State, indent: number) {
  const stack = state.stack
  const content = stream.skipToEnd()

  if (content.startsWith('```')) {
    stack.shift()
    return
  }

  stack[0].children.push({
    type: 'TEXT',
    indent,
    content
  })
}

function handleOthers(stream: StringStream, state: State, indent: number) {
  const stack = state.stack

  const level = indent
  const content = stream.skipToEnd()

  if (content) {
    while (stack.length > 1 && stack[0].level >= level) {
      stack.shift()
    }

    stack[0].children.push({
      type: 'TEXT',
      indent,
      content
    })
  }
}

const markdown: Mode<State> = {
  startState() {
    const root = {
      type: 'ROOT',
      level: 0,
      indent: 0,
      content: '',
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
    stream.eatWhile(/\s/)
    const indent = Math.floor(stream.current().length / 2)

    if (state.stack[0].type === 'CODE') {
      handleCodeContent(stream, state, indent)
    } else if (stream.match(/```/)) {
      handleCodeHeader(stream, state, indent)
    } else if (stream.peek() === '#') {
      handleHeader(stream, state, indent)
    } else if (stream.peek() === '-') {
      handleList(stream, state, indent)
    } else {
      handleOthers(stream, state, indent)
    }
  }
}

export default markdown
