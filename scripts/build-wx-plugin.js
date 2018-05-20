const path = require('path');
const fs = require('fs-extra');
const find = require('find');
require('shelljs/global');
const extracter = require('./utils/extracter');

const buildConfig = {
  src: path.resolve(__dirname, '../packages'),
  dist: path.resolve(__dirname, '../wx-plugin-dist'),
  componentDist: path.resolve(__dirname, '../wx-plugin-dist/dist'),
  exampleDir: path.resolve(__dirname, '../example'),
  miniprogramDir: path.resolve(__dirname, '../wx-plugin-dist/miniprogram'),
  miniprogramPagesDir: path.resolve(__dirname, '../wx-plugin-dist/miniprogram/pages')
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
  fs.copySync(
    buildConfig.exampleDir,
    buildConfig.miniprogramDir,
    {
      filter: (item) => {
        if (
          item.indexOf('example/dist') > 0
          || item.indexOf('project.config.json') > 0
        ) {
          return false;
        }
        return true;
      },
      overwrite: false
    }
  );

  // 处理 app.json 增加自定义组件依赖
  const miniprogramAppJson = path.resolve(buildConfig.miniprogramDir, './app.json');
  fs.readJson(miniprogramAppJson, (err, jsonFile) => {
    jsonFile.plugins = {
      zanui: {
        version: 'dev',
        provider: 'touristappid'
      }
    };

    fs.writeJson(miniprogramAppJson, jsonFile);
  });

  // 处理 json 文件，将内部依赖变为自定义组件形式
  find.file(/\.json$/, buildConfig.miniprogramPagesDir, (files) => {
    files.forEach((file) => {
      fs.readJson(file, (err, jsonFile) => {
        if (err) {
          console.error(err);
          return;
        }

        const components = jsonFile.usingComponents;
        if (!components) {
          return;
        }

        const newJsonFile = { ...jsonFile };
        const newUsingComponents = { ...components };
        Object.keys(components).forEach((depName) => {
          let depValue = newUsingComponents[depName];
          if (depName !== 'doc-page') {
            depValue = `plugin://zanui/${depName}`;
          }
          newUsingComponents[depName] = depValue;
        });
        newJsonFile.usingComponents = newUsingComponents;

        fs.writeJson(file, newJsonFile);
      });
    });
  });
}

buildWxPlugin();
