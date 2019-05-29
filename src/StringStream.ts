export default class StringStream {
  private source: string
  private pos: number
  private start: number
  private lineStart: number

  constructor(source: string) {
    this.source = source
    this.pos = 0
    this.start = 0
    this.lineStart = 0
  }

  sol() {
    return this.pos === this.lineStart
  }

  eol() {
    return this.pos >= this.source.length
  }

  peek() {
    return this.source.charAt(this.pos) || undefined
  }

  next() {
    return this.source.charAt(this.pos++) || undefined
  }

  eat(match: string | RegExp | ((ch: string) => boolean)) {
    const ch = this.source.charAt(this.pos)
    const ok =
      (typeof match === 'string' && ch === match) ||
      (match instanceof RegExp && match.test(ch)) ||
      (typeof match === 'function' && match(ch))

    if (ok) {
      this.pos++
      return ch
    }

    return ''
  }

  eatWhile(match: string | RegExp | ((ch: string) => boolean)) {
    const start = this.pos
    while (this.eat(match)) {}
    return this.pos > start
  }

  match(pattern: string, consume?: boolean): null | string
  match(pattern: RegExp, consume?: boolean): null | RegExpMatchArray
  match(pattern: string | RegExp, consume?: boolean): null | string | RegExpMatchArray {
    if (typeof pattern === 'string') {
      const str = this.source.substr(this.pos, pattern.length)

      if (pattern === str) {
        if (consume) this.pos += pattern.length
        return pattern
      }

      return null
    }

    const match = this.source.slice(this.pos).match(pattern)

    if (match && match.index! > 0) return null
    if (match && consume) this.pos += match[0].length

    return match
  }

  skipToEnd() {
    const str = this.source.slice(this.pos)
    this.pos = this.source.length
    return str
  }

  current() {
    return this.source.slice(this.start, this.pos)
  }

  goAhead() {
    this.start = this.pos
  }
}
