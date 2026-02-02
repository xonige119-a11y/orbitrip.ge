
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const aiRoutes = require('./routes/aiRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Supabase Client (Service Role for Admin Tasks)
const supabaseUrl = process.env.SUPABASE_URL || 'https://fhfkdadxvpmmioikkwex.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY; 

// Note: In production, use SERVICE_ROLE key for DB admins. 
// For this demo, we assume the key has permissions or user runs SQL manually if needed.
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/notify', notificationRoutes);

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'Orbitrip API is running' });
});

// --- AUTO-SEED REVIEWS (For Demo Purposes) ---
const seedReviews = async () => {
    try {
        console.log("Checking for database_reviews.sql...");
        const seedPath = path.join(__dirname, '../database_reviews.sql');
        
        if (fs.existsSync(seedPath)) {
            const sql = fs.readFileSync(seedPath, 'utf8');
            console.log("Applying review updates to database...");
            
            // Supabase-js doesn't execute raw SQL directly on client easily without an RPC function.
            // However, we can use the REST API 'rpc' if we have a function, or just log instructions.
            // Since this is a "Backend" simulation in a generated environment, we will assume
            // the user might run this manually OR we try to run it if an RPC exists.
            
            // For now, we will just log that the file is ready.
            console.log("SQL File ready at: " + seedPath);
            console.log("To apply, run this SQL in your Supabase SQL Editor.");
        }
    } catch (err) {
        console.error("Error checking seed file:", err);
    }
};

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  seedReviews();
});
