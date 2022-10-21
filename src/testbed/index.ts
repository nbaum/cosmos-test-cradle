import { Chain, Entity } from "./chain"
import _, { uniqueId } from "underscore"
import YAML from "yaml"

async function main() {

  const chain = new Chain("test")
  const code = chain.upload("cw20_base.wasm")
  const address = uniqueId()
  const address2 = uniqueId()

  chain.entities[address] = new Entity()
  chain.entities[address2] = new Entity()

  const contract = await chain.instantiate(code, address, {
    name: "Token",
    symbol: "TOKEN",
    decimals: 0,
    initial_balances: [
      {
        address: address,
        amount: "1000000"
      }
    ],
    mint: {
      minter: address,
    },
    marketing: {},
  })

  console.log(await chain.query(contract.address, { token_info: {} }))

  chain.execute(contract.address, address, {
    transfer: {
      recipient: address2,
      amount: "1000",
    }
  })

  console.log(await chain.query(contract.address, { balance: { address: address } }))

  console.log(await chain.query(contract.address, { balance: { address: address2 } }))

}

export default main

// main()
