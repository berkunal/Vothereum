require('babel-register')
module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: 800000,
      from: '0x67c4680151ac33affaa8c56dcbb08dfecdb7ea19'
    }
  }
}