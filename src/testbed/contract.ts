import { Imports } from "./imports"
import { Exports } from "./exports"
import { Chain, Entity } from "./chain"
import { fromBase64 } from "@cosmjs/encoding"

export type Result = {
  ok?: any,
  error?: string,
}

interface Env { }
interface Info { }
interface Msg { }

export class Contract {

  chain?: Chain
  address: string
  imports: Imports
  exports: Exports
  instance: WebAssembly.Instance
  module: WebAssembly.Module
  memory: WebAssembly.Memory
  
  get state () {
    if (this.chain)
      return (this.chain.entities[this.address] ||= new Entity()).state ||= {}
    return {}
  }

  static async make(chain: Chain | undefined, wasm: BufferSource, address: string) {
    let contract: Contract
    const imports = new Imports(() => contract)
    const { instance, module } = await WebAssembly.instantiate(wasm, {
      env: imports.toWasm()
    })
    contract = new this(chain, address, instance, module, imports)
    return contract
  }

  private constructor(chain: Chain | undefined, address: string, instance: WebAssembly.Instance, module: WebAssembly.Module, imports: Imports) {
    this.chain = chain
    this.address = address
    this.imports = imports
    this.instance = instance
    this.module = module
    this.exports = new Exports(instance.exports)
    this.memory = instance.exports.memory as WebAssembly.Memory
  }

  instantiate(env: Env, info: Info, msg: Msg): Result {
    const envPtr = this.#allocate(JSON.stringify(env))
    const infoPtr = this.#allocate(JSON.stringify(info))
    const msgPtr = this.#allocate(JSON.stringify(msg))
    const resultPtr = this.exports.instantiate!(envPtr, infoPtr, msgPtr)
    try {
      const result = JSON.parse(this.read(resultPtr)) as Result
      if (result.error)
        throw result.error
      return result.ok
    } finally {
      this.#deallocate(resultPtr)
    }
  }

  execute(env: Env, info: Info, msg: Msg): any {
    const envPtr = this.#allocate(JSON.stringify(env))
    const infoPtr = this.#allocate(JSON.stringify(info))
    const msgPtr = this.#allocate(JSON.stringify(msg))
    const resultPtr = this.exports.execute!(envPtr, infoPtr, msgPtr)
    try {
      const result = JSON.parse(this.read(resultPtr)) as Result
      if (result.error)
        throw result.error
      return result.ok
    } finally {
      this.#deallocate(resultPtr)
    }
  }

  query(env: Env, msg: Msg, json = true): any {
    const envPtr = this.#allocate(JSON.stringify(env))
    const msgPtr = this.#allocate(JSON.stringify(msg))
    const resultPtr = this.exports.query!(envPtr, msgPtr)
    try {
      const result = JSON.parse(this.read(resultPtr)) as Result
      if (result.error)
        throw result.error
      if (json)
        return JSON.parse(Buffer.from(fromBase64(result.ok)).toString())
      else
        return result.ok
    } finally {
      this.#deallocate(resultPtr)
    }
  }

  read(regionPtr: number) {
    const region = new Uint32Array(this.memory.buffer, regionPtr, 3)
    const space = new Uint8Array(this.memory.buffer, region[0], region[1])
    return Buffer.from(space).toString()
  }

  write(data: string | Buffer): number {
    return this.#allocate(data)
  }

  #allocate(data: string | Buffer) {
    const buffer = Buffer.from(data)
    const regionPtr = this.exports.allocate!(buffer.byteLength)
    const region = new Uint32Array(this.memory.buffer, regionPtr, 3)
    const space = new Uint8Array(this.memory.buffer, region[0], region[1])
    space.set(buffer)
    region[2] = buffer.byteLength
    return regionPtr
  }

  #deallocate(ptr: number) {
    this.exports.deallocate!(ptr)
  }

  // execute: (env_ptr: u32, info_ptr: u32, msg_ptr: u32) => number
  // query: (env_ptr: u32, msg_ptr: u32) => number
  // migrate: (env_ptr: u32, info_ptr: u32, msg_ptr: u32) => number
  // reply: (env_ptr: u32, msg_ptr: u32) => number
  // sudo: (env_ptr: u32, msg_ptr: u32) => number
  // ibc_channel_open: (env_ptr: u32, msg_ptr: u32) => number
  // ibc_channel_connect: (env_ptr: u32, msg_ptr: u32) => number
  // ibc_channel_close: (env_ptr: u32, msg_ptr: u32) => number
  // ibc_packet_receive: (env_ptr: u32, msg_ptr: u32) => number
  // ibc_packet_ack: (env_ptr: u32, msg_ptr: u32) => number
  // ibc_packet_timeout: (env_ptr: u32, msg_ptr: u32) => number

}
