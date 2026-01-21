import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import helmet from 'helmet'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import roomRoutes from './routes/rooms.js'
import bookingRoutes from './routes/bookings.js'
import { requestId } from './middleware/requestId.js'
import { logger } from './logger.js'
import { authLimiter, bookingLimiter } from './middleware/rateLimit.js'
import paymentRoutes from './routes/payments.js'
import { initSentry } from './sentry.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

initSentry()
app.disable('x-powered-by')
app.use(requestId)
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*'
}))
app.use(helmet())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  logger.info({ req: { method: req.method, url: req.url }, requestId: (req as any).requestId }, 'request_start')
  res.on('finish', () => {
    const duration = Date.now() - start
    logger.info({ res: { statusCode: res.statusCode }, duration, requestId: (req as any).requestId }, 'request_end')
  })
  next()
})

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/bookings', bookingLimiter, bookingRoutes)
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/payments', paymentRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    import('./db/index.js').then(async ({ db }) => {
      try {
        await db.execute(`select 1`);
        res.status(200).json({ success: true, message: 'ok', db: 'up' })
      } catch {
        res.status(503).json({ success: false, message: 'db unavailable' })
      }
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({ err: error, requestId: (req as any).requestId }, 'unhandled_error')
  res.status(500).json({
    success: false,
    error: 'Server internal error',
    requestId: (req as any).requestId,
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
