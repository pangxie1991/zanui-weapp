const path = require('path');
const fs = require('fs-extra');
require('shelljs/global');
const extracter = require('./utils/extracter');

const buildConfig = {
  src: path.resolve(__dirname, '../packages'),
  dist: path.resolve(__dirname, '../wx-plugin-dist'),
  componentDist: path.resolve(__dirname, '../wx-plugin-dist/dist')
};

function buildWxPlugin() {
  fs.emptyDirSync(buildConfig.dist);
  
  // 拷贝起始模板
  fs.copySync(
    path.resolve(__dirname, './wx-plugin-template'),
    path.resolve(__dirname, '../wx-plugin-dist')
  );

  // 拷贝组件
  extracter({
    src: buildConfig.src,
    dist: buildConfig.componentDist,
    skipClear: true
  });

  // 拷贝示例代码
  const srcBase = path.resolve(__dirname, '../example');
  fs.copySync(
    srcBase,
    path.resolve(__dirname, '../wx-plugin-dist/miniprogram'),
    {
      filter: (item) => {
        if (item.indexOf('example/dist') > 0) {
          return false;
        }
        return true;
      },
      overwrite: false
    }
  );
}

buildWxPlugin();
