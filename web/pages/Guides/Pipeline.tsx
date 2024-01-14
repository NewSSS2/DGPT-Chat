import { Component } from 'solid-js'
import PageHeader from '/web/shared/PageHeader'
import { markdown } from '/web/shared/markdown'

const PipelineGuide: Component = () => {
  return (
    <>
      <PageHeader
        title="Pipeline Guide"
        subtitle="How to install and use the DomGPT Pipeline API"
      ></PageHeader>
      <div class="markdown" innerHTML={markdown.makeHtml(text)}></div>
    </>
  )
}

const text = ``

export default PipelineGuide
