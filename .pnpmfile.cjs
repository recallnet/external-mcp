function readPackage(pkg) {
  // Force all packages to have a build-dep on @recallnet/mcp-types
  if (pkg.name !== '@recallnet/mcp-types' && pkg.name.startsWith('@recallnet/')) {
    if (!pkg.dependencies) pkg.dependencies = {};
    pkg.dependencies['@recallnet/mcp-types'] = 'workspace:*';
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
}; 