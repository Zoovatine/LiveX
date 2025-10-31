import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGIN?.split(',') || "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// keep track of widget rooms: widget:{id}
io.on('connection', (socket) => {
  socket.on('join_widget', (widgetId) => {
    socket.join(`widget:${widgetId}`);
  });
});

// helper to broadcast new totals
async function broadcastWidgetTotal(widgetId) {
  const { data, error } = await supabase
    .from('widgets')
    .select('id, total_cents, currency')
    .eq('id', widgetId)
    .single();

  if (!error && data) {
    io.to(`widget:${widgetId}`).emit('widget_update', {
      id: data.id,
      totalCents: data.total_cents,
      currency: data.currency
    });
  }
}

// webhook endpoint from Whatnot / Streamlabs / test
app.post('/webhook/event', async (req, res) => {
  // You will map their payload to yours here
  const { user_id, widget_id, amount_cents, source, payload } = req.body;

  if (!user_id || !amount_cents) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // 1) insert event
  const { error: evErr } = await supabase.from('events').insert({
    user_id,
    widget_id,
    amount_cents,
    source: source || 'manual',
    payload: payload || {}
  });
  if (evErr) return res.status(500).json({ error: evErr.message });

  // 2) update total on widget
  if (widget_id) {
    const { error: widErr } = await supabase.rpc('add_to_widget_total', {
      widgetid: widget_id,
      add_cents: amount_cents
    });
    if (widErr) {
      console.error(widErr);
    } else {
      broadcastWidgetTotal(widget_id);
    }
  }

  return res.json({ ok: true });
});

// simple health
app.get('/', (req, res) => {
  res.json({ ok: true });
});

const port = process.env.PORT || 4000;
httpServer.listen(port, () => {
  console.log('Backend running on port', port);
});
