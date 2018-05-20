const path = require('path');
const fs = require('fs-extra');
require('shelljs/global');
const extracter = require('../utils/extracter');
const copyExample = require('./example');

const buildConfig = {
  src: path.resolve(__dirname, '../../packages'),
  dist: path.resolve(__dirname, '../../wx-plugin-dist'),
  componentDist: path.resolve(__dirname, '../../wx-plugin-dist/dist'),
  exampleDir: path.resolve(__dirname, '../../example'),
  miniprogramDir: path.resolve(__dirname, '../../wx-plugin-dist/miniprogram'),
  miniprogramPagesDir: path.resolve(__dirname, '../../wx-plugin-dist/miniprogram/pages')
};

function buildWxPlugin() {
  fs.emptyDirSync(buildConfig.dist);

  // 拷贝起始模板
  fs.copySync(
    path.resolve(__dirname, './wx-plugin-template'),
    path.resolve(__dirname, '../../wx-plugin-dist')
  );

  // 拷贝组件
  extracter({
    src: buildConfig.src,
    dist: buildConfig.componentDist,
    skipClear: true
  });

  // 拷贝示例代码
  copyExample({
    exampleDir: buildConfig.exampleDir,
    miniprogramDir: buildConfig.miniprogramDir,
    miniprogramPagesDir: buildConfig.miniprogramPagesDir
  });
}

buildWxPlugin();
