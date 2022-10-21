import { readFileSync } from "fs"
import _, { uniqueId } from "underscore"
import { Contract, Result } from "./contract"

export class Coin {
  denom = ""
  amount = ""
}

export class Entity {
  balance = {} as Record<string, number>
  code = null as number | null
  state = {} as Record<string, string>
  deposit(amount: number, denom: string) {
    this.balance[denom] ||= 0
    this.balance[denom] += amount
    return this
  }
  setCode(code: number | null) {
    this.code = code
    return this
  }
}

export class Chain {

  id: string

  lastId = 0
  entities = {} as Record<string, Entity>
  codes = [] as string[]
  blocks = []

  constructor(id: string) {
    this.id = id
  }

  upload(file: string) {
    this.codes.push(file)
    return this.codes.length - 1
  }

  async instantiate(code: number, sender: string, msg: any, funds: Coin[] = []) {
    const height = this.blocks.length
    const time = "0"
    const chain_id = this.id
    const address = uniqueId();
    this.entities[address] ||= new Entity().setCode(code)
    const env = {
      block: {
        height,
        time,
        chain_id,
      },
      contract: {
        address,
      },
    }
    const info = {
      sender,
      funds,
    }
    const wasm = readFileSync(this.codes[code]!)
    const contract = await Contract.make(this, wasm, address)
    const result = contract.instantiate(env, info, msg) as any
    return { address, result }
  }

  async execute(address: string, sender: string, msg: any, funds: Coin[] = []) {
    const height = this.blocks.length
    const time = "0"
    const chain_id = this.id
    const contractEntity = this.entities[address]!
    const env = {
      block: {
        height,
        time,
        chain_id,
      },
      contract: {
        address,
      },
    }
    const info = {
      sender,
      funds,
    }
    const wasm = readFileSync(this.codes[contractEntity.code!]!)
    const contract = await Contract.make(this, wasm, address)
    const result = contract.execute(env, info, msg) as any
    return result
  }

  async query(address: string, msg: any, json = true) {
    const height = this.blocks.length
    const time = "0"
    const chain_id = this.id
    const contractEntity = this.entities[address]!
    const env = {
      block: {
        height,
        time,
        chain_id,
      },
      contract: {
        address,
      },
    }
    const wasm = readFileSync(this.codes[contractEntity.code!]!)
    const contract = await Contract.make(this, wasm, address)
    const result = contract.query(env, msg, json) as any
    return result
  }

  query_raw (address: string, key: string) {
    return this.entities[address]?.state[key]
  }

  // const result = contract.instantiate(
  //   {
  //     block: {
  //       height: 0,
  //       time: "0",
  //       chain_id: "",
  //     },
  //     contract: {
  //       address: "",
  //     }
  //   },
  //   {
  //     sender: "",
  //     funds: [],
  //   },
  //   {
  //   },
  // )
  // }
}
