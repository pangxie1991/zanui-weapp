const path = require('path');
const fs = require('fs-extra');
require('shelljs/global');
const extracter = require('./utils/extracter');

const buildConfig = {
  src: path.resolve(__dirname, '../packages'),
  dist: path.resolve(__dirname, '../wx-plugin-dist'),
  pluginDist: path.resolve(__dirname, '../wx-plugin-dist/plugin/components'),
};

function buildWxPlugin() {
  fs.ensureDirSync(buildConfig.dist);
  fs.emptyDirSync(buildConfig.dist);

  // 拷贝组件
  extracter({
    src: buildConfig.src,
    dist: buildConfig.pluginDist
  });
}

buildWxPlugin();
