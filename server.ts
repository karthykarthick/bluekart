import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';

dotenv.config();

const PORT = 3000;

// Lazy Stripe initialization as per environment guidelines
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key && key.startsWith('sk_')) {
      stripeClient = new Stripe(key);
    }
  }
  return stripeClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'BlueCart Retail API',
      timestamp: new Date().toISOString(),
      stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
      supabaseConfigured: Boolean(process.env.VITE_SUPABASE_URL),
    });
  });

  // Stripe config endpoint
  app.get('/api/stripe/config', (req, res) => {
    res.json({
      publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
      hasSecretKey: Boolean(process.env.STRIPE_SECRET_KEY),
    });
  });

  // Create payment intent
  app.post('/api/create-payment-intent', async (req, res) => {
    try {
      const { amount, currency = 'usd', orderId, customerEmail } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Valid amount is required (in cents)' });
      }

      const stripe = getStripe();
      if (stripe) {
        // Real Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount),
          currency: currency.toLowerCase(),
          receipt_email: customerEmail,
          metadata: {
            orderId: orderId || 'order_' + Date.now(),
            store: 'BlueCart Retail',
          },
          automatic_payment_methods: {
            enabled: true,
          },
        });

        return res.json({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          mode: 'live_stripe',
        });
      }

      // Simulated Stripe sandbox response for test / preview mode
      const simulatedId = `pi_test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const simulatedSecret = `${simulatedId}_secret_${Math.random().toString(36).substring(2, 12)}`;

      return res.json({
        clientSecret: simulatedSecret,
        paymentIntentId: simulatedId,
        mode: 'simulated_test',
        message: 'Stripe simulated test transaction (No secret key set in .env). Test card accepted.',
      });
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ error: error.message || 'Payment intent creation failed' });
    }
  });

  // Confirm / capture webhook or simulate instant success
  app.post('/api/confirm-payment', async (req, res) => {
    try {
      const { paymentIntentId } = req.body;
      const stripe = getStripe();

      if (stripe && paymentIntentId && !paymentIntentId.startsWith('pi_test_')) {
        const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
        return res.json({ status: intent.status, paid: intent.status === 'succeeded' });
      }

      // Instant approval for demo/simulated payments
      return res.json({ status: 'succeeded', paid: true, isSimulated: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BlueCart Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
