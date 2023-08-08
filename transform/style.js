module.exports = function (sourceAst, $, options) {
  
  const htmlAst = $(sourceAst.root().generate(), { parseOptions: { language: 'html' } })
  const styles = htmlAst.find('<style></style>')
  if (styles.length <= 1) return sourceAst
  const newStyleTagAst = $('<style module></style>', { parseOptions: { language: 'html' } })
  const moduleAttr = (newStyleTagAst.attr('content.attributes') || []).find(attr => attr.key.content === 'module')

  let styleContent = '';
  styles.each((ast, index) => {
    let isScoped = false;
    let isLink = false
    const attrs = ast.attr('content.attributes') || []
    attrs.forEach((attr) => {
      const key = attr.key.content;
      if (key === 'src') {
        isLink = true
        styleContent = `@import '${attr.value.content}';
        ` + styleContent
      }
      if (key === 'scoped') {
        isScoped = true
        attr.remove()
      }
    });
    if (!isLink) {
      styleContent += ast.node?.content?.value?.content || ''
    }
    if (index === styles.length - 1) {
      ast.node.content.value.content = styleContent
      if (isScoped) {
        ast.attr('content.attributes', [...attrs, moduleAttr])
      }
    } else {
      ast.remove()
    }
  })

  return htmlAst.root()
}