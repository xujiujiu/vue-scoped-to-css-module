module.exports = function (sourceAst, $, options) {
  
  const htmlAst = $(sourceAst.root().generate(), { parseOptions: { language: 'html' } })
  const styles = htmlAst.find('<style></style>')
  if (styles.length <= 1) return sourceAst

  let styleContent = '';
  styles.each((ast, index) => {
    let isLink = false
    const attrs = ast.attr('content.attributes') || []
    attrs.forEach((attr) => {
      const key = attr.key.content;
      if (key === 'src') {
        isLink = true
        styleContent = `@import '${attr.value.content}';
        ` + styleContent
      }
    });
    if (!isLink) {
      styleContent += ast.node?.content?.value?.content || ''
    }
    if (index === styles.length - 1) {
      ast.node.content.value.content = styleContent
    } else {
      ast.remove()
    }
  })

  return htmlAst.root()
}