# 🇧🇷 SolidSign API - Exemplo de Integração: Assinatura XAdES (XML) com HSM/Nuvem (Node.js (Fastify))

## Requisitos

- Fastify / Node.js 18+ (`npm install && cp .env.example .env`)
- Um token JWT válido (`POST /solidsign/auth/token`)
- Credenciais de um certificado custodiado em HSM/PSC de nuvem

## Como rodar

```bash
npm install && cp .env.example .env
npm start
```

O serviço sobe em `http://localhost:3094`.

## Como funciona

Este back-end expõe os endpoints abaixo, que recebem um formulário (`multipart/form-data`) e repassam os dados pra SolidSign API real (`POST /solidsign/dsig/xml/sign-hsm-cloud`), devolvendo o resultado:

- `POST /api/xml/sign-cloud` — modo lote: varre a pasta configurada em `SOLIDSIGN_BATCH_INPUT_PATH` por arquivos `.xml`, assina todos, baixa os XMLs assinados e gera um ZIP em `SOLIDSIGN_BATCH_OUTPUT_PATH`.
- `POST /api/xml/sign-cloud/form` — recebe os arquivos e parâmetros diretamente no formulário e devolve o ZIP assinado na resposta.

A chave privada nunca deixa o HSM do provedor — a API SolidSign assina remotamente usando as credenciais informadas em `cloudCredentials`.

## Variáveis do formulário

| Campo | Significado | Default |
|---|---|---|
| `document[i]` | Documento(s) XML a assinar | — |
| `authorization` | Token JWT (Bearer) | — |
| `baseUrl` | URL base da SolidSign API | `https://www.solidsign.com.br` |
| `cloudCredentials` | Credenciais do HSM/PSC de nuvem (JSON: `uuidCert`, `hsmToken`, `hsmServiceUrl`) | — |
| `profile` | Perfil de assinatura XAdES/PBAD (ex. `ADRB`, `ADRT`, `ADRC`, `ADRA`, `XADES_B`, `XADES_T`, `XADES_LT`, `XADES_LTA`) | `ADRB` |
| `hashAlgorithm` | Algoritmo de hash (`SHA256`/`SHA384`/`SHA512`) | `SHA256` |
| `signaturePackaging` | `ENVELOPED`, `ENVELOPING` ou `DETACHED` | `ENVELOPED` |
| `signatureNodeName` | Nome local do elemento XML alvo (ex. `NFe`) | — |
| `signatureNodeNamespace` | Namespace URI do elemento alvo | — |
| `canonicalizationMethod` | `INCLUSIVE`, `EXCLUSIVE`, `INCLUSIVE_WITH_COMMENTS` ou `EXCLUSIVE_WITH_COMMENTS` | `EXCLUSIVE` |
| `isRemoveXPathExclusionFilter` | `true`/`false` | `false` |
| `isRemoveNamespacePrefixFromNodeNames` | `true`/`false` | `false` |
| `isSignKeyInfo` | `true`/`false` | `true` |
| `signatureNodeId` | ID do nó XML alvo, quando há múltiplos elementos elegíveis (opcional) | — |
| `policyVersion` | OID da política ICP-Brasil (opcional) | — |

## Tratamento de erros

Respostas `400`/`500` da SolidSign API são logadas com o corpo JSON de erro retornado (`console.error`), e o endpoint local responde `500` com `{ "error": "Processing failed. Check logs." }`.

---

# 🇬🇧 SolidSign API - Integration Example: XAdES (XML) Signing with HSM/Cloud (Node.js (Fastify))

## Requirements

- Fastify / Node.js 18+ (`npm install && cp .env.example .env`)
- A valid JWT token (`POST /solidsign/auth/token`)
- Credentials for a certificate custodied in a cloud HSM/PSC

## Running

```bash
npm install && cp .env.example .env
npm start
```

The service starts on `http://localhost:3094`.

## How it works

This backend exposes the endpoints below, which accept a form (`multipart/form-data`) and forward the data to the real SolidSign API (`POST /solidsign/dsig/xml/sign-hsm-cloud`), returning the result:

- `POST /api/xml/sign-cloud` — batch mode: scans the folder configured in `SOLIDSIGN_BATCH_INPUT_PATH` for `.xml` files, signs all of them, downloads the signed XMLs and produces a ZIP in `SOLIDSIGN_BATCH_OUTPUT_PATH`.
- `POST /api/xml/sign-cloud/form` — accepts the files and parameters directly in the form and returns the signed ZIP in the response.

The private key never leaves the provider's HSM — the SolidSign API signs remotely using the credentials passed in `cloudCredentials`.

## Form fields

| Field | Meaning | Default |
|---|---|---|
| `document[i]` | XML document(s) to sign | — |
| `authorization` | JWT (Bearer) token | — |
| `baseUrl` | SolidSign API base URL | `https://www.solidsign.com.br` |
| `cloudCredentials` | Cloud HSM/PSC credentials (JSON: `uuidCert`, `hsmToken`, `hsmServiceUrl`) | — |
| `profile` | XAdES/PBAD signature profile (e.g. `ADRB`, `ADRT`, `ADRC`, `ADRA`, `XADES_B`, `XADES_T`, `XADES_LT`, `XADES_LTA`) | `ADRB` |
| `hashAlgorithm` | Hash algorithm (`SHA256`/`SHA384`/`SHA512`) | `SHA256` |
| `signaturePackaging` | `ENVELOPED`, `ENVELOPING` or `DETACHED` | `ENVELOPED` |
| `signatureNodeName` | Local name of the target XML element (e.g. `NFe`) | — |
| `signatureNodeNamespace` | Target element's namespace URI | — |
| `canonicalizationMethod` | `INCLUSIVE`, `EXCLUSIVE`, `INCLUSIVE_WITH_COMMENTS` or `EXCLUSIVE_WITH_COMMENTS` | `EXCLUSIVE` |
| `isRemoveXPathExclusionFilter` | `true`/`false` | `false` |
| `isRemoveNamespacePrefixFromNodeNames` | `true`/`false` | `false` |
| `isSignKeyInfo` | `true`/`false` | `true` |
| `signatureNodeId` | Target XML node ID, when multiple elements are eligible (optional) | — |
| `policyVersion` | ICP-Brasil policy OID (optional) | — |

## Error handling

`400`/`500` responses from the SolidSign API are logged with the returned JSON error body (`console.error`), and the local endpoint responds `500` with `{ "error": "Processing failed. Check logs." }`.

---

# 🇪🇸 SolidSign API - Ejemplo de Integración: Firma XAdES (XML) con HSM/Nube (Node.js (Fastify))

## Requisitos

- Fastify / Node.js 18+ (`npm install && cp .env.example .env`)
- Un token JWT válido (`POST /solidsign/auth/token`)
- Credenciales de un certificado custodiado en HSM/PSC en la nube

## Cómo ejecutar

```bash
npm install && cp .env.example .env
npm start
```

El servicio se inicia en `http://localhost:3094`.

## Cómo funciona

Este backend expone los siguientes endpoints, que reciben un formulario (`multipart/form-data`) y envían los datos a la API real de SolidSign (`POST /solidsign/dsig/xml/sign-hsm-cloud`), devolviendo el resultado:

- `POST /api/xml/sign-cloud` — modo lote: recorre la carpeta configurada en `SOLIDSIGN_BATCH_INPUT_PATH` en busca de archivos `.xml`, firma todos, descarga los XML firmados y genera un ZIP en `SOLIDSIGN_BATCH_OUTPUT_PATH`.
- `POST /api/xml/sign-cloud/form` — recibe los archivos y parámetros directamente en el formulario y devuelve el ZIP firmado en la respuesta.

La clave privada nunca sale del HSM del proveedor — la API SolidSign firma de forma remota usando las credenciales indicadas en `cloudCredentials`.

## Campos del formulario

| Campo | Significado | Default |
|---|---|---|
| `document[i]` | Documento(s) XML a firmar | — |
| `authorization` | Token JWT (Bearer) | — |
| `baseUrl` | URL base de la API SolidSign | `https://www.solidsign.com.br` |
| `cloudCredentials` | Credenciales del HSM/PSC en la nube (JSON: `uuidCert`, `hsmToken`, `hsmServiceUrl`) | — |
| `profile` | Perfil de firma XAdES/PBAD (ej. `ADRB`, `ADRT`, `ADRC`, `ADRA`, `XADES_B`, `XADES_T`, `XADES_LT`, `XADES_LTA`) | `ADRB` |
| `hashAlgorithm` | Algoritmo de hash (`SHA256`/`SHA384`/`SHA512`) | `SHA256` |
| `signaturePackaging` | `ENVELOPED`, `ENVELOPING` o `DETACHED` | `ENVELOPED` |
| `signatureNodeName` | Nombre local del elemento XML objetivo (ej. `NFe`) | — |
| `signatureNodeNamespace` | Namespace URI del elemento objetivo | — |
| `canonicalizationMethod` | `INCLUSIVE`, `EXCLUSIVE`, `INCLUSIVE_WITH_COMMENTS` o `EXCLUSIVE_WITH_COMMENTS` | `EXCLUSIVE` |
| `isRemoveXPathExclusionFilter` | `true`/`false` | `false` |
| `isRemoveNamespacePrefixFromNodeNames` | `true`/`false` | `false` |
| `isSignKeyInfo` | `true`/`false` | `true` |
| `signatureNodeId` | ID del nodo XML objetivo, cuando hay múltiples elementos elegibles (opcional) | — |
| `policyVersion` | OID de la política ICP-Brasil (opcional) | — |

## Manejo de errores

Las respuestas `400`/`500` de la API SolidSign se registran con el cuerpo JSON de error devuelto (`console.error`), y el endpoint local responde `500` con `{ "error": "Processing failed. Check logs." }`.
