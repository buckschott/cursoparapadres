const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qclacxcgfprkswuiboop.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjbGFjeGNnZnBya3N3dWlib29wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzExMDAwNiwiZXhwIjoyMDc4Njg2MDA2fQ.3K3mclTi4Uiy9C3oYbuohm6ndHs8TAry-RRLQj_iOQE'
);

async function main() {
  const { data, error } = await supabase
    .from('exam_questions')
    .select('*')
    .in('question_id', ['A001', 'A002', 'A003', 'A010', 'A020', 'A040', 'B001', 'C001'])
    .order('question_id');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Total questions in database (checking 8 samples):\n');
  
  data.forEach(q => {
    console.log(q.question_id + '. ' + q.question_text);
    console.log('   A) ' + q.answer_a);
    console.log('   B) ' + q.answer_b);
    console.log('   C) ' + q.answer_c);
    console.log('   D) ' + q.answer_d);
    console.log('   ✓ Correct: ' + q.correct_position);
    console.log('');
  });
}

main();
