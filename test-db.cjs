const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

const env = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=')
  if (key && val) acc[key.trim()] = val.join('=').trim()
  return acc
}, {})

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

async function run() {
  const testEvent = {
    id: 'evt-ai-test-123',
    slug: 'ai-test-event',
    title: 'Hackathon AI Demo',
    description: 'This is a permanent test event created directly from the backend to verify the database connection.',
    organizer: 'EventQuest AI',
    totalPoolNIM: 500,
    published: true,
    creatorAddress: 'NQ00 0000 0000 0000 0000',
    tasks: [{
      id: 'task-ai-1',
      type: 'quiz',
      title: 'Did the AI successfully connect to Supabase?',
      description: 'Testing the quiz insertion.',
      rewardNIM: 10,
      maxWinners: 5,
      winnerCount: 0,
      options: ['Yes', 'No', 'Maybe'],
      correctIndex: 0
    }]
  }
  
  const { error: insertErr } = await supabase.from('events').upsert(testEvent)
  
  if (insertErr) {
    console.error('❌ ERROR INSERTING REAL PAYLOAD:', insertErr)
  } else {
    console.log('✅ INSERT SUCCESS: Event "Hackathon AI Demo" is now in the DB!')
  }
  
  process.exit(0)
}
run()
