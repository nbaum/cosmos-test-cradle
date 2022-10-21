import { Chain, Entity } from "./testbed/chain"
import _, { uniqueId } from "underscore"

const chain = new Chain("test")
const code = chain.upload("cw20_base.wasm")
const address1 = uniqueId()
const address2 = uniqueId()

let contract = ""

test("contract instantiation succeeds", async () => {

  const result = await chain.instantiate(code, address1, {
    name: "Token",
    symbol: "TOKEN",
    decimals: 0,
    initial_balances: [
      {
        address: address1,
        amount: "1000"
      },
      {
        address: address2,
        amount: "2000"
      }
    ],
    mint: {
      minter: address1,
    },
    marketing: {},
  })

  expect(result.address).toBe("3")

  contract = result.address

})

test("accounts have right balance", async () => {
  await expect(chain.query(contract, { balance: { address: address1 } })).resolves.toStrictEqual({ balance: "1000" })
  await expect(chain.query(contract, { balance: { address: address2 } })).resolves.toStrictEqual({ balance: "2000" })
})

test("address1 can send funds to address2", async () => {
  await expect(chain.execute(contract, address1, { transfer: { recipient: address2, amount: "1000" } })).resolves.toBeDefined()
})

test("accounts have right balance after transfer", async () => {
  await expect(chain.query(contract, { balance: { address: address1 } })).resolves.toStrictEqual({ balance: "0" })
  await expect(chain.query(contract, { balance: { address: address2 } })).resolves.toStrictEqual({ balance: "3000" })
})

test("address1 can't send funds to address2 any more", async () => {
  await expect(chain.execute(contract, address1, { transfer: { recipient: address2, amount: "1000" } })).rejects.toBeDefined()
})
