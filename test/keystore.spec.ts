import { testPassword, getStoredWallet, storeWallet, removeWallet } from '../src/libocoin-keystore'

const mockWallet = {
  libocoinAddress: `libo1r5v5srda7xfth3hn2s26txvrcrntldjumt8mhl`,
  mnemonic: `abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art`,
  privateKey: `8088c2ed2149c34f6d6533b774da4e1692eb5cb426fdbaef6898eeda489630b7`,
  publicKey: `02ba66a84cf7839af172a13e7fc9f5e7008cb8bca1585f8f3bafb3039eda3c1fdd`
}
const mockWallet2 = Object.assign({}, mockWallet, {
  libocoinAddress: `libo1r5v5srda7xfth3hn2s26txvrcrntldjumt8mh2`
})
const mockWallet3 = Object.assign({}, mockWallet, {
  libocoinAddress: `libo1r5v5srda7xfth3hn2s26txvrcrntldjumt8mh3`
})

describe(`Keystore`, () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it(`stores a wallet`, () => {
    storeWallet(mockWallet, 'mock-name', 'mock-password')
    expect(
      localStorage.getItem(`libonomy-wallets-libo1r5v5srda7xfth3hn2s26txvrcrntldjumt8mhl`)
    ).toBeDefined()
  })

  it(`stores a collection of wallet names to prevent name collision`, () => {
    storeWallet(mockWallet, 'mock-name', 'mock-password')
    storeWallet(mockWallet2, 'mock-name2', 'mock-password')
    storeWallet(mockWallet3, 'mock-name3', 'mock-password')
    expect(JSON.parse(localStorage.getItem(`libonomy-wallets-index`) || '[]')).toEqual([
      {
        name: `mock-name`,
        address: mockWallet.libocoinAddress
      },
      {
        name: `mock-name2`,
        address: mockWallet2.libocoinAddress
      },
      {
        name: `mock-name3`,
        address: mockWallet3.libocoinAddress
      }
    ])
  })

  it(`prevents you from adding a wallet with the same name twice`, () => {
    storeWallet(mockWallet, 'mock-name', 'mock-password')
    expect(() => storeWallet(mockWallet2, 'mock-name', 'mock-password2')).toThrow()

    expect(JSON.parse(localStorage.getItem(`libonomy-wallets-index`) || '[]')).toEqual([
      {
        name: `mock-name`,
        address: mockWallet.libocoinAddress
      }
    ])
  })

  it(`loads a stored wallet`, () => {
    storeWallet(mockWallet, 'mock-name', 'mock-password')
    const key = getStoredWallet(mockWallet.libocoinAddress, 'mock-password')
    expect(key.privateKey).toBe(mockWallet.privateKey)
  })

  it(`signals if there is no stored wallet for an address`, () => {
    expect(() => getStoredWallet(mockWallet.libocoinAddress, 'mock-password')).toThrow()
  })

  it(`signals if the password for the stored wallet is incorrect`, () => {
    storeWallet(mockWallet, 'mock-name', 'mock-password')
    expect(() => getStoredWallet(mockWallet.libocoinAddress, 'wrong-password')).toThrow()
  })

  it(`tests if a password is correct for a localy stored key`, () => {
    storeWallet(mockWallet, 'mock-name', 'mock-password')
    expect(() => testPassword(mockWallet.libocoinAddress, 'mock-password')).not.toThrow()
    expect(() => testPassword(mockWallet.libocoinAddress, 'wrong-password')).toThrow()
  })

  it(`throws if wallet to test password for is not existent for better error output`, () => {
    expect(() => testPassword(mockWallet.libocoinAddress, 'mock-password')).toThrow()
  })

  it(`prevents you from overwriting existing key names`, () => {
    storeWallet(mockWallet, 'mock-name', 'mock-password')
    expect(() => storeWallet(mockWallet, 'mock-name', 'mock-password')).toThrow()
  })

  it(`prevents you from overwriting existing wallets`, () => {
    storeWallet(mockWallet, 'mock-name', 'mock-password')
    expect(() => storeWallet(mockWallet, 'mock-name2', 'mock-password')).toThrow()
  })

  it(`removes a wallet`, () => {
    storeWallet(mockWallet, 'mock-name', 'mock-password')
    storeWallet(mockWallet2, 'mock-name2', 'mock-password')
    removeWallet(mockWallet.libocoinAddress, 'mock-password')
    expect(() => getStoredWallet(mockWallet.libocoinAddress, 'mock-password')).toThrow()
    expect(JSON.parse(localStorage.getItem(`libonomy-wallets-index`) || '[]')).toEqual([
      {
        name: `mock-name2`,
        address: mockWallet2.libocoinAddress
      }
    ])
  })

  it(`throws if the password for a wallet while removing is incorrect`, () => {
    storeWallet(mockWallet, 'mock-name', 'mock-password')
    expect(() => removeWallet(mockWallet.libocoinAddress, 'wrong-password')).toThrow()
    expect(() => getStoredWallet(mockWallet.libocoinAddress, 'mock-password')).not.toThrow()
  })

  it(`gives an error if the wallet to remove doesn't exist for better error outputs`, () => {
    expect(() => removeWallet(mockWallet.libocoinAddress, 'mock-password')).toThrow()
  })
})
