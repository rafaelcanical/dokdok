#!/usr/bin/env ts-node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
//@ts-ignore
const markdown_toc_1 = __importDefault(require("markdown-toc"));
// Get file name from argument
const file = process.argv.slice(2)[0];
// Methods
const methods = {
    GET: '🔵',
    POST: '🟢',
    PUT: '🟣',
    DELETE: '🔴',
    PATCH: '🟡'
};
/**
 * Get file content
 */
const getFileContent = async () => {
    try {
        const fileContent = await fs_1.promises.readFile(file, 'utf8');
        return JSON.parse(fileContent).resources;
    }
    catch (e) {
        console.error(e);
        return [];
    }
};
getFileContent().then(async (fileContent) => {
    await fs_1.promises.mkdir('./docs', { recursive: true });
    // Filter out workspaces and sort alphabetically
    const workspaces = fileContent
        .filter((item) => item._type === 'workspace')
        .sort((a, b) => {
        if (a.name < b.name)
            return -1;
        if (a.name > b.name)
            return 1;
        return 0;
    });
    workspaces.map((workspace) => {
        let doc = `[![back](https://imgur.com/OHeXRAL.png)](https://github.com/Intutor/docs#table-of-contents)\n\n<!--TOC-->\n\n`;
        // Filter out groups and sort alphabetically
        const groups = fileContent.filter((item) => item._type === 'request_group' && item.parentId === workspace._id);
        groups.map((group) => {
            doc += `# ${group.name}\n\n`;
            // Filter out request from a group and sort alphabetically
            const requests = fileContent.filter((item) => item._type === 'request' && item.parentId === group._id);
            requests.map((request) => {
                // Title
                doc += `## ${request.name}\n\n`;
                // Method and endpoint
                doc += methodAndEndpoint(request);
                // Add description
                if (request.description)
                    doc += `${request.description}\n\n`;
                // Requires authentication
                doc += checkIfRequiresAuth(request);
                // Add headers
                doc += headers(request);
                // Add url parameters
                doc += parameters(request);
                // Add body
                doc += body(request);
                // Back to top button
                doc += `[↑ Back to top ↑](#table-of-contents)\n\n`;
            });
        });
        const tableOfContents = (0, markdown_toc_1.default)(doc, { maxdepth: 2 }).content;
        doc = doc.replace('<!--TOC-->', `# Table of Contents\n\n${tableOfContents}`);
        fs_1.promises.writeFile(`docs/${workspace.name}.md`, doc);
    });
});
/**
 * Get method and endpoint
 */
function methodAndEndpoint(request) {
    const method = request?.method != null ? request.method : 'GET';
    const requestURL = request.url?.replace('{{ _.apiurl }}', '');
    const doc = `\`\`\`
${methods[method]} ${method}: ${requestURL}
\`\`\`\n\n`;
    return doc;
}
/**
 * Check if requires auth
 */
function checkIfRequiresAuth(request) {
    if (request?.authentication != null && Object.keys(request.authentication).length) {
        return `_Request requires authentication_\n\n`;
    }
    return '';
}
/**
 * Get headers information
 */
function headers(request) {
    let doc = '';
    if (request?.headers != null && request.headers.length) {
        doc += `### Headers\n\n`;
        doc += `| Name | Value | Description |\n`;
        doc += `| --- | --- | --- |\n`;
        request.headers.map((header) => {
            doc += `| \`${header.name}\` | ${header.value} | ${header?.description != null ? header.description : ''} |\n`;
        });
        doc += `\n`;
    }
    return doc;
}
/**
 * Get parameters information
 */
function parameters(request) {
    let doc = '';
    if (request?.parameters != null) {
        const parameters = request.parameters.filter((param) => param.disabled === false);
        if (parameters.length) {
            doc += `### Parameters\n\n`;
            doc += `| Name | Value | Description |\n`;
            doc += `| --- | --- | --- |\n`;
            parameters.map((parameter) => {
                doc += `| \`${parameter.name}\` | ${parameter.value} | ${parameter?.description != null ? parameter.description : ''} |\n`;
            });
            doc += `\n`;
        }
    }
    return doc;
}
/**
 * Get body information
 */
function body(request) {
    let doc = '';
    if (request?.parameters != null) {
        if (request?.body != null && request?.body?.mimeType === 'application/json' && request.body.text?.trim()?.length) {
            doc += `### Body\n\n`;
            doc += `\`\`\`json
${request.body.text.replaceAll(`\t`, '    ')}
\`\`\`\n\n`;
        }
    }
    return doc;
}
