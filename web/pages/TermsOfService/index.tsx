import { Component } from 'solid-js'
import PageHeader from '../../shared/PageHeader'
import { markdown } from '../../shared/markdown'

const text = ``

const TermsOfServicePage: Component = () => {
  return (
    <div>
      <PageHeader title={<>DomGPT Chat Terms of Service</>} />
      <div class="markdown flex flex-col gap-4" innerHTML={markdown.makeHtml(text)}></div>
    </div>
  )
}

export default TermsOfServicePage
