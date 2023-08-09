const postcss = require('postcss')

// 获取 css 对应的对象数据结构 styleObject
function getStyleObject(css, styleObject) {
  return new Promise(resolve => {
    const processor = postcss([
      (root) => {
        root.walkRules((rule) => {
          styleObject[rule.selector] = {}
          rule.walkDecls((decl) => {
            styleObject[rule.selector][decl.prop] = decl.value
          })
        })
      },
    ])
    processor.process(css).then((data) => {
      resolve(data)
    })
  })
}

function modifyClassNames(node, styleObject) {
  if (node.content && node.content.attributes) {
    const attrs = node.content.attributes || []
    const classAttr = attrs.find(attr => attr.key.content === 'class')
    if (classAttr.value && classAttr.value.content) {
      const classNames = classAttr.value.content.split(' ');
      const modifiedClassNames = classNames.map(className => {
        if (styleObjectHas(styleObject, className)) {
          classAttr.key.content = ':class'
          return `$style['${className}']`;
        }
        return className;
      });
      classAttr.value.content = modifiedClassNames.join(' ');
    }
  }
  if (node.content.children) {
    node.content.children.forEach((childNode) => childNode.nodeType === 'tag' && modifyClassNames(childNode, styleObject));
  }
}

function styleObjectHas(styleObject, key) {
  const keys = Object.keys(styleObject)
  if (typeof styleObject[`.${key}`] === 'object') return true

  for (let i = 0; i < keys.length; i++) {
    if (!/^\./.test(keys[i])) continue;
    if (styleObjectHas(styleObject[keys[i]], key)) return true
  }
  return false
}

module.exports = async function (source, $, options) {
	const htmlAst = $(source, { parseOptions: { language: 'html' } })
	const templates = htmlAst.find('<template></template>')
	const styles = htmlAst.find('<style></style>')
  if (!styles.length) return htmlAst.root()
  return new Promise(resolve => {
    styles.each(async (ast, index) => {
      const styleObject = {}
      const css = ast.attr('content.value.content')
      const attrs = ast.attr('content.attributes') || []
      let isScoped = false
      attrs.forEach(attr => {
        if (attr.key.content === 'scoped') {
          isScoped = true
          attr.key.content = 'module'
        }
      })
      if (isScoped) {
        await getStyleObject(css, styleObject)
        modifyClassNames(templates.node, styleObject)
      }
      if (index === styles.length - 1) {
        resolve(htmlAst.generate())
      }
    })
  })
}
