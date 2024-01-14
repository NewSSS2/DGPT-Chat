import { Component } from 'solid-js'
import PageHeader from '../../shared/PageHeader'
import { markdown } from '../../shared/markdown'

const text = `
`

const PrivacyPolicyPage: Component = () => {
  return (
    <div>
      <PageHeader title={<>DomGPT Chat Privacy Policy</>} />
      <div class="markdown flex flex-col gap-4" innerHTML={markdown.makeHtml(text)}></div>
    </div>
  )
}
export default PrivacyPolicyPage
