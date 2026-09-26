'use strict'
/**
 * [EN]    XAdES (XML) signing — Cloud HSM / PSC (Fastify / Node.js 18+).
 *         Setup: npm install && cp .env.example .env  (edit .env)
 *         Run:   npm start
 *         Batch: POST http://localhost:3094/api/xml/sign-cloud
 *         Form:  POST http://localhost:3094/api/xml/sign-cloud/form
 *
 * [PT-BR] Assinatura XAdES (XML) — Cloud HSM / PSC (Fastify / Node.js 18+).
 *         Configurar: npm install && cp .env.example .env  (editar .env)
 *         Executar:   npm start
 */
require('dotenv').config()
const Fastify = require('fastify')
const { signXmlCloud, signBatch } = require('./service')

const fastify = Fastify({ logger: true })
fastify.register(require('@fastify/multipart'))

// ── Batch endpoint ────────────────────────────────────────────────────────────
fastify.post('/api/xml/sign-cloud', async (_req, reply) => {
  const inputPath = process.env.SOLIDSIGN_BATCH_INPUT_PATH ?? ''
  const fs = require('fs')
  if (!fs.existsSync(inputPath) || !fs.statSync(inputPath).isDirectory()) {
    return reply.status(400).send({ error: `Invalid input path: ${inputPath}` })
  }
  const outPath = await signBatch()
  if (!outPath) return reply.status(500).send({ error: 'Processing failed. Check logs.' })
  return { message: `Processing completed! ZIP generated at: ${outPath}` }
})

// ── Form endpoint ─────────────────────────────────────────────────────────────
fastify.post('/api/xml/sign-cloud/form', async (request, reply) => {
  const parts   = request.parts()
  const xmlFiles = []
  const fields   = {}

  for await (const part of parts) {
    if (part.file) {
      const buf = await part.toBuffer()
      xmlFiles.push({ buffer: buf, filename: part.filename })
    } else {
      fields[part.fieldname] = part.value
    }
  }

  const zipBuf = await signXmlCloud({
    authorization:    fields.authorization,
    baseUrl:          fields.baseUrl,
    cloudCredentials: fields.cloudCredentials,
    files:            xmlFiles,
    sigParams:        fields,
  })

  if (!zipBuf) return reply.status(500).send({ error: 'Processing failed. Check logs.' })
  reply.type('application/zip').header('Content-Disposition', 'attachment; filename="signed_xml.zip"')
  return zipBuf
})

fastify.listen({ port: Number(process.env.PORT ?? 3094), host: '0.0.0.0' }, err => {
  if (err) { fastify.log.error(err); process.exit(1) }
})
