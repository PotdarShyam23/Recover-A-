// saving everting from voice inDB

export async function simulateVoiceConversation(caseRecord) {
  return {
    channel: 'voice',
    status: 'completed',
    transcript: 'Customer says: Friday ko salary aayegi, Friday ko kar dunga.',
    extracted_intent: 'promise_to_pay',
    extracted_promise: '2026-09-04',
    case_id: caseRecord.id,
    customer_id: caseRecord.customer_id,
    timestamp: new Date().toISOString()
  };
}
