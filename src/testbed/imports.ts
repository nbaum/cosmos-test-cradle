import { Contract } from "./contract"
import { entries, map, reverse, sumBy } from "lodash"

const j = JSON.stringify

export class Imports {

  getter: () => Contract

  scanners = [] as [string, string][][]

  r(ptr: number) {
    return this.contract.read(ptr)
  }

  w(str: string | Buffer) {
    return this.contract.write(str)
  }

  sections(...strings: string[]) {
    const buffers = map(strings, s => Buffer.from(s))
    const buffer = Buffer.alloc(sumBy(buffers, b => b.byteLength) + 4 * strings.length)
    let i = 0
    for (var input of buffers) {
      buffer.set(input, i)
      buffer.writeUInt32BE(input.byteLength, i + input.byteLength)
      i += input.byteLength + 4
    }
    return buffer
  }

  scan(start: string, end: string, order: number) {
    const result = [] as [string, string][]
    for (const [key, value] of entries(this.contract.state)) {
      if (key >= start && key < end) {
        result.push([key, value])
      }
    }
    if (order == 1)
      return reverse(result.sort())
    else
      return result.sort()
  }


  get contract() {
    return this.getter()
  }

  constructor(getter: () => Contract) {
    this.getter = getter
  }

  log(msg: string) {
    // console.debug(msg)
  }

  db_read(key_ptr: number): number {
    const key = this.r(key_ptr)
    this.log(`db_read(${j(key)})`)
    if (this.contract.state[key]) {
      return this.w(this.contract.state[key]!)
    } else {
      return 0
    }
  }

  db_write(key_ptr: number, value_ptr: number) {
    const key = this.r(key_ptr)
    const value = this.r(value_ptr)
    this.log(`db_write(${j(key)}, ${j(value)})`)
    this.contract.state[key] = value
  }

  db_remove(key_ptr: number) {
    const key = this.r(key_ptr)
    this.log(`db_remove(${j(key)})`)
    delete this.contract.state[key]
  }

  db_scan(start_ptr: number, end_ptr: number, order: number): number {
    const start = this.r(start_ptr)
    const end = this.r(end_ptr)
    this.log(`db_scan(${j(start)}, ${j(end)}, ${j(order)})`)
    this.scanners.push(this.scan(start, end, order))
    return this.scanners.length - 1
  }

  db_next(iterator_id: number): number {
    this.log(`db_next(${iterator_id})`)
    const scanner = this.scanners[iterator_id]
    if (!scanner)
      return 0
    const top = scanner.pop()
    if (!top)
      return this.w(this.sections("", ""))
    return this.w(this.sections(top[0], top[1]))
  }

  addr_validate(source_ptr: number): number {
    const source = this.r(source_ptr)
    this.log(`addr_validate(${j(source)})`)
    return 0
  }

  addr_canonicalize(source_ptr: number, destination_ptr: number): number {
    this.log("addr_canonicalize")
    return 0
  }

  addr_humanize(source_ptr: number, destination_ptr: number): number {
    this.log("addr_humanize")
    return 0
  }

  secp256k1_verify(message_hash_ptr: number, signature_ptr: number, public_key_ptr: number): number {
    this.log("secp256k1_verify")
    return 0
  }

  secp256k1_recover_pubkey(message_hash_ptr: number, signature_ptr: number, recovery_param: number): number {
    this.log("secp256k1_recover_pubkey")
    return 0
  }

  ed25519_verify(message_ptr: number, signature_ptr: number, public_key_ptr: number): number {
    this.log("ed25519_verify")
    return 0
  }

  ed25519_batch_verify(messages_ptr: number, signatures_ptr: number, public_keys_ptr: number): number {
    this.log("ed25519_batch_verify")
    return 0
  }

  debug(source_ptr: number) {
    const source = this.r(source_ptr)
    this.log(`from contract: ${source}`)
  }

  query_chain(request: number): number {
    return 0
  }

  toWasm() {
    return {
      db_read: this.db_read.bind(this),
      db_write: this.db_write.bind(this),
      db_remove: this.db_remove.bind(this),
      db_scan: this.db_scan.bind(this),
      db_next: this.db_next.bind(this),
      addr_validate: this.addr_validate.bind(this),
      addr_canonicalize: this.addr_canonicalize.bind(this),
      addr_humanize: this.addr_humanize.bind(this),
      secp256k1_verify: this.secp256k1_verify.bind(this),
      secp256k1_recover_pubkey: this.secp256k1_recover_pubkey.bind(this),
      ed25519_verify: this.ed25519_verify.bind(this),
      ed25519_batch_verify: this.ed25519_batch_verify.bind(this),
      debug: this.debug.bind(this),
      query_chain: this.query_chain.bind(this),
    }
  }

}
