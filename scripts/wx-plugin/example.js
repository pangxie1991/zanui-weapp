const path = require('path');
const fs = require('fs-extra');
const find = require('find');

module.exports = function ({
  exampleDir,
  miniprogramDir,
  miniprogramPagesDir
}) {
  copyExampleDir(exampleDir, miniprogramDir);

  solveAppJsonDep(miniprogramDir);

  solvePageJsonDep(miniprogramPagesDir);

  solvePageJsDep(miniprogramPagesDir);
};

// 处理 js 文件，将直接引用 dist 中内容的改为引用插件依赖
const needToSolveJsDepMap = [
  'toast',
  'toptips',
  'dialog'
];
function solvePageJsDep(miniprogramPagesDir) {
  needToSolveJsDepMap.forEach((item) => {
    const jsPath = path.resolve(miniprogramPagesDir, `${item}/index.js`);
    fs.readFile(jsPath, 'utf8')
      .then((fileData) => {
        fileData = fileData.replace(
          /const\s*([^\s=]*)[^.]*\.\.\/\.\.\/dist\/[^/]*\/[^;]*/,
          (match, key) => {
            return `const { ${key} } = requirePlugin('zanui')`;
          }
        );
        fs.outputFile(jsPath, fileData);
      });
  });
}

// 处理 json 文件，将内部依赖变为自定义组件形式
function solvePageJsonDep(miniprogramPagesDir) {
  find.file(/\.json$/, miniprogramPagesDir, (files) => {
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

// 处理 app.json
// 1. 去除不需要的页面
// 2. 增加自定义组件依赖
function solveAppJsonDep(miniprogramDir) {
  const miniprogramAppJson = path.resolve(miniprogramDir, './app.json');
  fs.readJson(miniprogramAppJson, (err, jsonFile) => {
    // 去除不需要的页面
    const pages = jsonFile.pages || [];
    const helperIndex = pages.indexOf('pages/helper/index');
    pages.splice(helperIndex, 1);

    // 增加自定义组件依赖
    jsonFile.plugins = {
      zanui: {
        version: 'dev',
        provider: 'touristappid'
      }
    };

    fs.writeJson(miniprogramAppJson, jsonFile);
  });
}

function copyExampleDir(src, dist) {
  fs.copySync(
    src,
    dist,
    {
      filter: (item) => {
        if (
          item.indexOf('example/dist') > 0
          || item.indexOf('project.config.json') > 0
          || item.indexOf('helper') > 0
        ) {
          return false;
        }
        return true;
      },
      overwrite: false
    }
  );
}
