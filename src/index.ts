import fs from 'fs'
import path from 'path'
import StringParser from './StringParser'
import markdown from './modes/markdown'

const source = fs.readFileSync(path.resolve(__dirname, 'test.md'), 'utf8')
const parser = new StringParser(source, markdown)

// const result = `module.exports = ${JSON.stringify(json)}`
const result = JSON.stringify(parser.run(), null, 2)

fs.writeFileSync(path.resolve(__dirname, 'test.js'), result, 'utf8')
