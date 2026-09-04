// fixed boundaries for the AI

export const LIMITS = {
  MAX_RETRIES: 3,
  MAX_WHATSAPP_ATTEMPTS: 2,
  MAX_VOICE_ATTEMPTS: 1,
  MIN_COOLDOWN_HOURS: 6,
  QUIET_HOURS_START: 21, // 9 PM
  QUIET_HOURS_END: 9,    // 9 AM
  MAX_RECOVERY_WINDOW_DAYS: 21
};

export function evaluatePolicyGuardrails(caseRecord, proposedAction) {
  const now = new Date();
  const currentHour = now.getHours();

  // 1. Quiet Hours Enforcement (Do not spam customer between 9 PM and 9 AM)
  if (currentHour >= LIMITS.QUIET_HOURS_START || currentHour < LIMITS.QUIET_HOURS_END) {
    if (['whatsapp', 'sms', 'voice'].includes(proposedAction)) {
      return {
        approved: false,
        fallbackAction: 'wait',
        reason: `Quiet hours active (${LIMITS.QUIET_HOURS_START}:00 to 0${LIMITS.QUIET_HOURS_END}:00). Customer communication postponed until morning window.`
      };
    }
  }

  // 2. Cooldown Enforcement

  // mssg must be send after 6 hrs
  if (caseRecord.nextActionAt && new Date(caseRecord.nextActionAt) > now) {
    return {
      approved: false,
      fallbackAction: 'wait',
      reason: 'Cooldown window has not elapsed yet. Guardrail prevents premature communication.'
    };
  }

  // 3. WhatsApp touch limit
  // max limit reach in WP move to voice 
  if (proposedAction === 'whatsapp' && (caseRecord.messageAttempts || 0) >= LIMITS.MAX_WHATSAPP_ATTEMPTS) {
    return {
      approved: false,
      fallbackAction: 'voice',
      reason: `WhatsApp communication limit reached (${LIMITS.MAX_WHATSAPP_ATTEMPTS} attempts). Escalating to Hinglish Voice Agent.`
    };
  }

  // 4. Voice touch limit

  // max limit touch in voice stop the case 
  if (proposedAction === 'voice' && (caseRecord.voiceAttempts || 0) >= LIMITS.MAX_VOICE_ATTEMPTS) {
    return {
      approved: false,
      fallbackAction: 'stop',
      reason: `Voice call limit reached (${LIMITS.MAX_VOICE_ATTEMPTS} attempt). Further automated intervention stopped.`
    };
  }

  // 5. Total case lifetime
  // max day reach still not recoverd stop
  const ageDays = (now - new Date(caseRecord.createdAt || Date.now())) / (1000 * 60 * 60 * 24);
  if (ageDays > LIMITS.MAX_RECOVERY_WINDOW_DAYS) {
    return {
      approved: false,
      fallbackAction: 'stop',
      reason: `Recovery window of ${LIMITS.MAX_RECOVERY_WINDOW_DAYS} days exceeded. Stopping to avoid customer annoyance.`
    };
  }

  return {
    approved: true,
    fallbackAction: null,
    reason: 'Strategy complies with merchant policy and anti-spam guardrails.'
  };
}
