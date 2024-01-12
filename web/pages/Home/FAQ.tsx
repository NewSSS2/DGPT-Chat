import { Component } from 'solid-js'
import PageHeader from '/web/shared/PageHeader'
import { markdown } from '/web/shared/markdown'

const FAQ: Component = () => {
  return (
    <>
      <PageHeader title="FAQ" subtitle="Frequently Asked Questions"></PageHeader>
      <div class="markdown" innerHTML={markdown.makeHtml(faq)}></div>
    </>
  )
}

export default FAQ

const faq = ``
