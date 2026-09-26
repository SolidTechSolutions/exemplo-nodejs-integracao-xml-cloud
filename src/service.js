'use strict'
/**
 * [EN]    XAdES (XML) signing — Cloud HSM / PSC (one-step, batch).
 *         Uses native fetch + FormData (Node.js 18+) and JSZip.
 * [PT-BR] Assinatura XAdES (XML) — Cloud HSM / PSC (passo único, em lote).
 *         Usa fetch + FormData nativos (Node.js 18+) e JSZip.
 */
const fs   = require('fs')
const path = require('path')
const JSZip = require('jszip')

async function signXmlCloud({ authorization, baseUrl, cloudCredentials, files, sigParams = {} }) {
  const form = new FormData()
  files.forEach(({ buffer, filename }, i) => form.append(`document[${i}]`, new Blob([buffer]), filename))

  form.append('cloudCredentials', typeof cloudCredentials === 'string' ? cloudCredentials : JSON.stringify(cloudCredentials))
  appendSigParamsXml(form, sigParams)

  const resp = await fetch(`${baseUrl.replace(/\/$/, '')}/solidsign/dsig/xml/sign-hsm-cloud`, {
    method: 'POST',
    headers: { Authorization: authorization },
    body: form,
  })
  if (!resp.ok) { console.error(`SolidSign error ${resp.status}: ${await resp.text()}`); return null }

  const signResp = await resp.json()
  return downloadAndZip(signResp, files.map(f => f.filename), authorization)
}

async function signBatch() {
  const inputPath  = process.env.SOLIDSIGN_BATCH_INPUT_PATH ?? ''
  const outputPath = process.env.SOLIDSIGN_BATCH_OUTPUT_PATH ?? ''
  const xmlFiles   = fs.readdirSync(inputPath).filter(f => f.endsWith('.xml'))

  if (!xmlFiles.length) { console.log(`No XML files found in ${inputPath}`); return null }
  console.log(`Found ${xmlFiles.length} files for cloud processing.`)

  const files = xmlFiles.map(f => ({ buffer: fs.readFileSync(path.join(inputPath, f)), filename: f }))

  const zipBuf = await signXmlCloud({
    authorization:    process.env.SOLIDSIGN_AUTHORIZATION,
    baseUrl:          process.env.SOLIDSIGN_BASE_URL,
    cloudCredentials: process.env.SOLIDSIGN_CLOUD_CREDENTIALS,
    files,
    sigParams: {
      profile:                              process.env.SOLIDSIGN_PROFILE,
      hashAlgorithm:                        process.env.SOLIDSIGN_HASH_ALGORITHM,
      signaturePackaging:                   process.env.SOLIDSIGN_SIGNATURE_PACKAGING,
      signatureNodeName:                    process.env.SOLIDSIGN_SIGNATURE_NODE_NAME,
      signatureNodeNamespace:               process.env.SOLIDSIGN_SIGNATURE_NODE_NAMESPACE,
      canonicalizationMethod:                process.env.SOLIDSIGN_CANONICALIZATION_METHOD,
      isRemoveXPathExclusionFilter:          process.env.SOLIDSIGN_IS_REMOVE_XPATH_EXCLUSION_FILTER,
      isRemoveNamespacePrefixFromNodeNames:  process.env.SOLIDSIGN_IS_REMOVE_NAMESPACE_PREFIX_FROM_NODE_NAMES,
      isSignKeyInfo:                        process.env.SOLIDSIGN_IS_SIGN_KEY_INFO,
      signatureNodeId:                      process.env.SOLIDSIGN_SIGNATURE_NODE_ID,
      policyVersion:                        process.env.SOLIDSIGN_POLICY_VERSION,
    },
  })
  if (!zipBuf) return null

  if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true })
  const outPath = path.join(outputPath, `signed_xml_cloud_${Date.now()}.zip`)
  fs.writeFileSync(outPath, zipBuf)
  console.log(`XAdES Cloud signing complete. Output: ${outPath}`)
  return outPath
}

function appendSigParamsXml(form, p) {
  const add = (k, v) => { if (v !== undefined && v !== null && v !== '') form.append(k, String(v)) }
  add('profile', p.profile)
  add('hashAlgorithm', p.hashAlgorithm)
  add('signaturePackaging', p.signaturePackaging)
  add('signatureNodeName', p.signatureNodeName)
  add('signatureNodeNamespace', p.signatureNodeNamespace)
  add('canonicalizationMethod', p.canonicalizationMethod)
  add('isRemoveXPathExclusionFilter', p.isRemoveXPathExclusionFilter)
  add('isRemoveNamespacePrefixFromNodeNames', p.isRemoveNamespacePrefixFromNodeNames)
  add('isSignKeyInfo', p.isSignKeyInfo)
  add('signatureNodeId', p.signatureNodeId)
  add('policyVersion', p.policyVersion)
}

async function downloadAndZip(signResp, originalNames, auth) {
  const zip = new JSZip()
  for (let i = 0; i < signResp.documents.length; i++) {
    const selfLink = (signResp.documents[i].links || []).find(l => l.rel === 'self') || signResp.documents[i]._links?.self
    if (!selfLink) continue
    const dlResp = await fetch(selfLink.href, { headers: { Authorization: auth } })
    if (!dlResp.ok) continue
    const name = originalNames[i] || `document_${i}.xml`
    zip.file(`signed_${name}`, Buffer.from(await dlResp.arrayBuffer()))
  }
  return zip.generateAsync({ type: 'nodebuffer' })
}

module.exports = { signXmlCloud, signBatch }
