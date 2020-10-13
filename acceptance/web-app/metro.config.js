const path = require('path');

const workspacePackagesPath = path.resolve(__dirname, '../../packages');

module.exports = {
  projectRoot: __dirname,
  watchFolders: [workspacePackagesPath],
  resolver: {
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => path.join(__dirname, `node_modules/${name}`)
      }
    )
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true
      }
    })
  }
};
