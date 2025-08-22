import 'dotenv/config'
import cors from 'cors'
import { createServer } from './server.js'

const port = Number(process.env.PORT || 4000)

// lista de origins permitidos, separados por vírgula no env CORS_ORIGIN
const ALLOW = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

// monta as opções dinamicamente pra refletir o Origin da request
const corsOptions = (req, cb) => {
  const origin = req.header('Origin')
  const isAllowed = !origin || ALLOW.includes(origin)

  cb(null, {
    origin: isAllowed ? origin : false,            // só libera se estiver na lista
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS','HEAD'],
    allowedHeaders: req.header('Access-Control-Request-Headers') || 'Authorization,Content-Type',
    maxAge: 86400                                   // cache do preflight por 24h
  })
}

const app = createServer()

// CORS precisa vir antes das rotas
app.use(cors(corsOptions))
// responde a qualquer preflight
app.options('*', cors(corsOptions))

// opcional: rota de saúde/raiz pra não dar "Cannot GET /"
app.get('/', (_req, res) => res.status(200).send('API up'))

app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`)
  console.log(`[api] CORS allowlist: ${ALLOW.join(', ') || '(none)'}`)
})
