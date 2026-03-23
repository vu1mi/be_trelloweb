import express from 'express'
import { CONNECT_DB, GET_DB , CLOSE_DB } from '~/config/mongodb.js'
import exitHook from 'async-exit-hook'
import {env} from '~/config/environment.js'
import {API_V1_ROUTES} from '~/routes/v1/index.js'
import {handlerError} from '~/middlewares/handlerErrorMiddleware.js'
import  cors from 'cors'
import { corsOptions } from '~/config/cors.js'


const START_SERVER = async () => {
  const app = express()
  app.use(cors(corsOptions))
  app.use(express.json()) // for parsing application/json
  app.get('/', (req, res) => {
    res.send('Welcome to Trello API 🚀')
  })
  app.use('/v1', API_V1_ROUTES)



  console.log(await GET_DB().listCollections().toArray())

  app.use(handlerError)
  app.listen(env.APP_PORT, () => {
    console.log(`🚀 Server running at http://localhost:${env.APP_PORT}`)
  })
  exitHook(signal =>{
    console.log(`Received ${signal}. Closing server...`)
    CLOSE_DB()
  })
}

CONNECT_DB()
  .then(async () => {
    console.log('Database connected, starting server...')
    await START_SERVER()
  })
  .catch((error) => {
    console.error('Failed to start server:', error)
    process.exit(1)
  })
