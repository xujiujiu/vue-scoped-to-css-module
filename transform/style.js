const postcss = require('postcss')
const $ = require('gogocode')

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
function formatClassNames(classNames, styleObject) {
  const modifiedClassNames = []
  let hasModuleCss = false
  classNames.forEach(className => {
    if (className.trim() !== '') {
      if (styleObjectHas(styleObject, className)) {
        modifiedClassNames.push(`$style['${className}']`);
        hasModuleCss = true
      } else {
        modifiedClassNames.push(`'${className}'`);
      }
    }
  });
  return {
    modifiedClassNames,
    hasModuleCss
  }
}

function modifyClassNames(node, styleObject) {
  if (node.content && node.content.attributes) {
    const attrs = node.content.attributes || []
    const classAttr = attrs.find(attr => attr.key.content === 'class') || {}
    const classAttrIndex = attrs.findIndex(attr => attr.key.content === 'class')
    const classAttrContent = classAttr.value && classAttr.value.content || ''
    const classDynamicAttr = attrs.find(attr => /(v-bind)?:class/g.test(attr.key.content)) || {}
    const classDynamicAttrIndex = attrs.findIndex(attr => /(v-bind)?:class/g.test(attr.key.content))
    const dynamicClassContent = classDynamicAttr.value && classDynamicAttr.value.content || ''
    const classNames = classAttrContent.trim().split(/\s+/) || [];
    const { hasModuleCss = false, modifiedClassNames = [] } = formatClassNames(classNames, styleObject)
    // 静态样式处理
    if (hasModuleCss) {
      if (!dynamicClassContent) {
        const sign = classAttr.endWrapper && classAttr.endWrapper.content === '\'' ? '\"' : '\''
        classAttr.key.content = ':class'
        classAttr.value.content = `[${modifiedClassNames.join(',').replace(/\'|\"/g, sign)}]`;
      }
    }
    // 动态样式处理
    if (dynamicClassContent) {
      const dccNode = $(dynamicClassContent, { parseOptions: { language: 'js' } }).node.program.body[0]
      let isArray = false
      if (dccNode.type === 'ExpressionStatement' && dccNode.expression.type === 'ArrayExpression') {
        isArray = true
        // 处理数组类型内的字符串值 如[{hello: true}, 'hello']中的hello
        dccNode.expression.elements.forEach(element => {
          if (element.type === 'StringLiteral') {
            const str = element.extra.raw
            classDynamicAttr.value.content = classDynamicAttr.value.content.replace(str, `$style[${str}]`)
          }
        })

      } else {
        // TODO 其他场景
      }
      if (hasModuleCss) {
        const dynamicSign = classDynamicAttr.endWrapper && classDynamicAttr.endWrapper.content === '\'' ? '\"' : '\''
        const addClassNames = modifiedClassNames.join(',').replace(/\'|\"/g, dynamicSign)
        if (isArray) {
          classDynamicAttr.value.content = classDynamicAttr.value.content.replace(/^\[/, `[${addClassNames},`)
        } else {
          classDynamicAttr.value.content = `[${classDynamicAttr.value.content}, ${addClassNames}]`
        }
        // 清除静态样式属性
        attrs.splice(classAttrIndex, 1)
      }
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
