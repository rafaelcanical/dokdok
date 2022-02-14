#!/usr/bin/env ts-node
import { promises as fs } from 'fs'
import { request } from 'http'
import { InsomniaNode } from './interfaces'

// Get file name from argument
const file = process.argv.slice(2)[0]

// Methods
const methods = {
  GET: '🔵',
  POST: '🟢',
  PUT: '🟣',
  DELETE: '🔴',
  PATCH: '🟡'
}

/**
 * Get file content
 */
const getFileContent = async (): Promise<InsomniaNode[]> => {
  try {
    const fileContent = await fs.readFile(file, 'utf8')
    return JSON.parse(fileContent).resources
  } catch (e) {
    console.error(e)
    return []
  }
}

getFileContent().then(async (fileContent) => {
  await fs.mkdir('./docs', { recursive: true })

  // Filter out workspaces and sort alphabetically
  const workspaces = fileContent
    .filter((item) => item._type === 'workspace')
    .sort((a, b) => {
      if (a.name < b.name) return -1
      if (a.name > b.name) return 1
      return 0
    })

  workspaces.map((workspace) => {
    let doc = `[![back](https://imgur.com/OHeXRAL.png)](https://github.com/Intutor/docs#table-of-contents)\n\n`

    // Filter out groups and sort alphabetically
    const groups = fileContent.filter((item) => item._type === 'request_group' && item.parentId === workspace._id)

    groups.map((group) => {
      doc += `# ${group.name}\n\n`

      // Filter out request from a group and sort alphabetically
      const requests = fileContent.filter((item) => item._type === 'request' && item.parentId === group._id)

      requests.map((request) => {
        const method = request?.method != null ? request.method : 'GET'
        const requestURL = request.url?.replace('{{ _.apiurl }}', '')

        // Title
        doc += `## ${request.name}\n\n`

        // Method and endpoint
        doc += `\`\`\`
${methods[method]} ${method}: ${requestURL}
\`\`\`\n\n`

        // Add description
        if (request.description) doc += `${request.description}\n\n`

        // Requires authentication
        if (request?.authentication != null && Object.keys(request.authentication).length) {
          doc += `_Request requires authentication_\n\n`
        }

        // Add headers
        if (request?.headers != null && request.headers.length) {
          doc += `### Headers\n\n`
          doc += `| Name | Value | Description |\n`
          doc += `| --- | --- | --- |\n`
          request.headers.map((header) => {
            doc += `| \`${header.name}\` | ${header.value} | ${
              header?.description != null ? header.description : ''
            } |\n`
          })
          doc += `\n`
        }

        // Add url parameters
        if (request?.parameters != null) {
          const parameters = request.parameters.filter((param) => param.disabled === false)
          if (parameters.length) {
            doc += `### Parameters\n\n`
            doc += `| Name | Value | Description |\n`
            doc += `| --- | --- | --- |\n`
            parameters.map((parameter) => {
              doc += `| \`${parameter.name}\` | ${parameter.value} | ${
                parameter?.description != null ? parameter.description : ''
              } |\n`
            })
            doc += `\n`
          }
        }

        // Add body
        if (request?.body != null && request?.body?.mimeType === 'application/json') {
          doc += `### Body\n\n`
          doc += `\`\`\`json
${request.body.text}
\`\`\`\n\n`
        }
      })
    })

    fs.writeFile(`docs/${workspace.name}.md`, doc)
  })
})
