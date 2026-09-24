require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { GoogleGenAI } = require('@google/genai');
const { prisma, connectDatabase, disconnectDatabase } = require('./data/store');
const { seedAmbulances } = require('./seed');
const { INDIA_BOUNDS, isSupportedCoordinate, supportedCoordinateError } = require('./geo');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST']
  }
});

const PORT = Number(process.env.PORT || 5000);

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});

const GEMINI_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  'gemini-2.5-flash-preview-05-20',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

const TRIAGE_SYSTEM_INSTRUCTION =
  'You are an emergency medical triage assistant for the CareConnect platform in India. ' +
  'Your role is to help users assess symptoms and provide immediate, practical first-aid instructions. ' +
  'Prioritize user safety above all else.\n\n' +
  'CRITICAL EMERGENCY NUMBER: CareConnect is based in India. Always refer to India emergency numbers: 112 (National Emergency) or 108 (Ambulance). NEVER mention 911 or non-India emergency numbers.\n\n' +
  'RESPONSE FORMAT STRUCTURE:\n' +
  'You MUST format EVERY response using clean, structured markdown following these sections where appropriate:\n\n' +
  '1. EMERGENCY ALERT (Only when symptoms are potentially severe or life-threatening such as chest pain, breathing difficulty, heavy bleeding, loss of consciousness, stroke symptoms, major trauma, anaphylaxis):\n' +
  '> 🚨 **EMERGENCY: CALL 112 IMMEDIATELY**\n' +
  '> Call 112 or 108 immediately for an ambulance. Do not wait or drive yourself to the hospital.\n\n' +
  '2. Section: ### What to do now\n' +
  'Provide clear numbered steps. Each step MUST start with a bold action title followed by a brief, practical explanation:\n' +
  '1. **Action title** - Specific instruction\n' +
  '2. **Action title** - Specific instruction\n\n' +
  '3. Section: ### Watch for\n' +
  'Provide a bulleted list of key warning signs or worsening symptoms to monitor:\n' +
  '- Symptom to watch for\n' +
  '- Symptom to watch for\n\n' +
  '4. Section: ### Get emergency help immediately if\n' +
  'Provide a bulleted list of specific critical red flags where 112 must be called immediately:\n' +
  '- Critical trigger\n' +
  '- Critical trigger\n\n' +
  'Keep the advice appropriate to the user symptoms. For non-emergency symptoms, omit the top Emergency Alert block but still provide the structured ### What to do now, ### Watch for, and ### Get emergency help immediately if sections. Never provide a clinical diagnosis or claim to replace a doctor. Use simple, reassuring language.';

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json());

app.post('/api/sos', async (req, res) => {
  const { userId, latitude, longitude, description } = req.body;

  if (userId == null || latitude == null || longitude == null) {
    return res.status(400).json({ error: 'userId, latitude, and longitude are required.' });
  }

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: 'latitude and longitude must be valid numbers.' });
  }
  if (!isSupportedCoordinate(lat, lng)) {
    return res.status(400).json({ error: supportedCoordinateError('SOS coordinates') });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.user.upsert({
        where: { id: String(userId) },
        update: {},
        create: { id: String(userId) }
      });

      const alertId = 'alert-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
      const alert = await tx.sosRequest.create({
        data: {
          id: alertId,
          userId: String(userId),
          latitude: lat,
          longitude: lng,
          description: description || null,
          status: 'pending'
        }
      });

      const available = await tx.ambulance.findMany({ where: { isAvailable: true } });
      let nearest = null;
      let minDistance = Infinity;
      for (const ambulance of available) {
        const distance = haversineDistance(lat, lng, ambulance.latitude, ambulance.longitude);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = ambulance;
        }
      }

      if (!nearest) return { alert, ambulance: null };

      const claimed = await tx.ambulance.updateMany({
        where: { id: nearest.id, isAvailable: true },
        data: { isAvailable: false }
      });
      if (claimed.count !== 1) return { alert, ambulance: null };

      const dispatchId = 'disp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
      const dispatch = await tx.dispatch.create({
        data: {
          id: dispatchId,
          alertId: alert.id,
          ambulanceId: nearest.id,
          userId: String(userId),
          pickupLatitude: lat,
          pickupLongitude: lng,
          ambulanceLatitude: nearest.latitude,
          ambulanceLongitude: nearest.longitude,
          distanceKm: minDistance,
          status: 'dispatched'
        }
      });
      const updatedAlert = await tx.sosRequest.update({
        where: { id: alert.id },
        data: { status: 'dispatched', ambulanceId: nearest.id }
      });
      return {
        alert: updatedAlert,
        dispatch,
        ambulance: { ...nearest, isAvailable: false, distanceKm: minDistance }
      };
    });

    const payload = { ...result.alert, dispatchId: result.dispatch?.id || null, ambulance: result.ambulance };
    io.emit('sos-alert', payload);
    res.status(200).json({ message: 'SOS endpoint received', alert: payload });
  } catch (error) {
    console.error('SOS endpoint error:', error.message);
    res.status(500).json({ error: 'Unable to create SOS request.' });
  }
});

app.get('/api/ambulances', async (req, res) => {
  try {
    res.status(200).json({ ambulances: await prisma.ambulance.findMany({ orderBy: { id: 'asc' } }) });
  } catch (error) {
    console.error('GET /api/ambulances error:', error.message);
    res.status(500).json({ error: 'Unable to fetch ambulances.' });
  }
});

app.get('/api/ambulances/available', async (req, res) => {
  try {
    const available = await prisma.ambulance.findMany({ where: { isAvailable: true }, orderBy: { id: 'asc' } });
    res.status(200).json({ ambulances: available });
  } catch (error) {
    console.error('GET /api/ambulances/available error:', error.message);
    res.status(500).json({ error: 'Unable to fetch available ambulances.' });
  }
});

app.get('/api/sos-alerts', async (req, res) => {
  try {
    const alerts = await prisma.sosRequest.findMany({ orderBy: { timestamp: 'desc' } });
    res.status(200).json({ alerts });
  } catch (error) {
    console.error('GET /api/sos-alerts error:', error.message);
    res.status(500).json({ error: 'Unable to fetch SOS alerts.' });
  }
});

app.get('/api/dispatches', async (req, res) => {
  try {
    const dispatches = await prisma.dispatch.findMany({ orderBy: { createdAt: 'desc' } });
    res.status(200).json({ dispatches });
  } catch (error) {
    console.error('GET /api/dispatches error:', error.message);
    res.status(500).json({ error: 'Unable to fetch dispatches.' });
  }
});

app.get('/api/dispatches/:id', async (req, res) => {
  try {
    const dispatch = await prisma.dispatch.findUnique({ where: { id: req.params.id } });
    if (!dispatch) {
      return res.status(404).json({ error: 'Dispatch not found.' });
    }
    res.status(200).json({ dispatch });
  } catch (error) {
    console.error('GET /api/dispatches/:id error:', error.message);
    res.status(500).json({ error: 'Unable to fetch dispatch.' });
  }
});

app.post('/api/dispatches/:id/complete', async (req, res) => {
  try {
    const dispatch = await prisma.dispatch.findUnique({ where: { id: req.params.id } });
    if (!dispatch) {
      return res.status(404).json({ error: 'Dispatch not found.' });
    }
    if (dispatch.status === 'completed') {
      return res.status(400).json({ error: 'Dispatch is already completed.' });
    }

    const completedAt = new Date();
    const result = await prisma.$transaction(async (tx) => {
      const updatedDispatch = await tx.dispatch.update({
        where: { id: dispatch.id },
        data: { status: 'completed', completedAt }
      });
      const ambulance = await tx.ambulance.update({
        where: { id: dispatch.ambulanceId },
        data: {
          isAvailable: true,
          latitude: dispatch.pickupLatitude,
          longitude: dispatch.pickupLongitude
        }
      });
      const alert = await tx.sosRequest.update({
        where: { id: dispatch.alertId },
        data: { status: 'completed' }
      });
      return { dispatch: updatedDispatch, ambulance, alert };
    });

    // Only emit after DB transaction confirmed success
    io.emit('dispatch-updated', result);
    res.status(200).json({ message: 'Dispatch completed.', dispatch: result.dispatch, ambulance: result.ambulance });
  } catch (error) {
    console.error('POST /api/dispatches/:id/complete error:', error.message);
    res.status(500).json({ error: 'Unable to complete dispatch.' });
  }
});

app.post('/api/dispatches/:id/accept', async (req, res) => {
  try {
    const dispatch = await prisma.dispatch.findUnique({ where: { id: req.params.id } });
    if (!dispatch) {
      return res.status(404).json({ error: 'Dispatch not found.' });
    }
    if (dispatch.status !== 'dispatched') {
      return res.status(400).json({ error: `Dispatch is already ${dispatch.status}.` });
    }
    const updatedDispatch = await prisma.dispatch.update({
      where: { id: dispatch.id },
      data: { status: 'en-route' }
    });
    // Only emit after DB write confirmed
    io.emit('dispatch-updated', { dispatch: updatedDispatch });
    res.status(200).json({ message: 'Dispatch accepted.', dispatch: updatedDispatch });
  } catch (error) {
    console.error('POST /api/dispatches/:id/accept error:', error.message);
    res.status(500).json({ error: 'Unable to accept dispatch.' });
  }
});

app.post('/api/ambulances/:id/location', async (req, res) => {
  const { id } = req.params;
  const { latitude, longitude } = req.body;

  if (latitude == null || longitude == null) {
    return res.status(400).json({ error: 'latitude and longitude are required.' });
  }

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: 'latitude and longitude must be valid numbers.' });
  }
  if (lat < -90 || lat > 90) {
    return res.status(400).json({ error: 'latitude must be between -90 and 90.' });
  }
  if (lng < -180 || lng > 180) {
    return res.status(400).json({ error: 'longitude must be between -180 and 180.' });
  }
  if (!isSupportedCoordinate(lat, lng)) {
    return res.status(400).json({ error: supportedCoordinateError('Ambulance coordinates') });
  }

  try {
    const existing = await prisma.ambulance.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Ambulance not found.' });
    }

    const ambulance = await prisma.ambulance.update({
      where: { id },
      data: { latitude: lat, longitude: lng }
    });

    const activeDispatch = await prisma.dispatch.findFirst({
      where: { ambulanceId: id, status: { not: 'completed' } },
      orderBy: { createdAt: 'desc' }
    });

    let distanceKm = activeDispatch
      ? haversineDistance(
          lat,
          lng,
          activeDispatch.pickupLatitude,
          activeDispatch.pickupLongitude
        )
      : null;

    const payload = {
      id: ambulance.id,
      unitNumber: ambulance.unitNumber,
      driverName: ambulance.driverName,
      phone: ambulance.phone,
      equipmentLevel: ambulance.equipmentLevel,
      baseStation: ambulance.baseStation,
      isAvailable: ambulance.isAvailable,
      latitude: ambulance.latitude,
      longitude: ambulance.longitude,
      updatedAt: ambulance.updatedAt,
      activeDispatchId: activeDispatch?.id || null,
      distanceKm
    };

    io.emit('ambulance-location-updated', payload);
    res.status(200).json({ ambulance });
  } catch (error) {
    console.error('Ambulance location update error:', error.message);
    res.status(500).json({ error: 'Unable to update ambulance location.' });
  }
});

app.post('/api/triage', async (req, res) => {
  console.log('[Triage] POST /api/triage received');

  const { message } = req.body || {};
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    console.warn('[Triage] Validation failed: message is missing or empty');
    return res.status(400).json({ error: 'Message is required and must be a non-empty string.' });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    console.error('[Triage] Error: GOOGLE_API_KEY is not configured');
    return res.status(500).json({
      error: 'AI triage service is not configured. Please set GOOGLE_API_KEY environment variable.'
    });
  }

  let reply = null;
  let lastError = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`[Triage] Gemini request started with model: ${modelName}`);

      const response = await genAI.models.generateContent({
        model: modelName,
        contents: message.trim(),
        config: {
          systemInstruction: TRIAGE_SYSTEM_INSTRUCTION
        }
      });

      let text = null;
      try {
        text = response?.text;
      } catch (textErr) {
        // response.text getter throws when model returns no content (e.g. safety block or empty output)
        const safeMsg = textErr.message ? textErr.message.replace(/key=[^&\s]+/gi, 'key=[REDACTED]') : 'Unknown error';
        console.warn(`[Triage] Model ${modelName} returned empty/blocked response: ${safeMsg}`);
      }

      if (text && typeof text === 'string' && text.trim().length > 0) {
        reply = text.trim();
        console.log(`[Triage] Gemini request completed successfully using ${modelName}`);
        break;
      } else {
        console.warn(`[Triage] Model ${modelName} returned no usable text, trying next model.`);
      }
    } catch (err) {
      lastError = err;
      const safeStatus = err.status || err.code || 'UNKNOWN';
      const safeMsg = err.message ? err.message.replace(/key=[^&\s]+/gi, 'key=[REDACTED]') : 'Unknown error';
      console.warn(`[Triage] Model ${modelName} failed [status: ${safeStatus}]: ${safeMsg}`);
    }
  }

  if (reply) {
    return res.status(200).json({ reply });
  }

  console.error('[Triage] All Gemini model attempts failed');
  return res.status(500).json({
    error: 'Triage assistant is temporarily unavailable. If this is an emergency, call 112 immediately.'
  });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  Promise.all([
    prisma.ambulance.findMany({ orderBy: { id: 'asc' } }),
    prisma.sosRequest.findMany({ orderBy: { timestamp: 'desc' } }),
    prisma.dispatch.findMany({ orderBy: { createdAt: 'desc' } })
  ])
    .then(([ambulances, alerts, dispatches]) => {
      const alertsWithAmbulances = alerts.map((alert) => {
        const dispatch = dispatches.find((item) => item.alertId === alert.id);
        const ambulance = dispatch ? ambulances.find((item) => item.id === dispatch.ambulanceId) : null;
        return {
          ...alert,
          dispatchId: dispatch?.id || null,
          ambulance: ambulance && dispatch ? { ...ambulance, distanceKm: dispatch.distanceKm } : null
        };
      });
      socket.emit('initial-state', {
        ambulances,
        alerts: alertsWithAmbulances,
        dispatches
      });
    })
    .catch((error) => console.error('Initial state error:', error.message));

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

async function start() {
  try {
    await connectDatabase();
    await seedAmbulances();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database startup failed:', error.message);
    process.exitCode = 1;
  }
}

process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

start();
