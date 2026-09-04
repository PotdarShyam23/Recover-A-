// to save in DB what mssg send via which channel 

export async function sendWhatsApp(caseRecord, message) {
  return {
    channel: 'whatsapp',
    status: 'sent',
    timestamp: new Date().toISOString(),
    message,
    case_id: caseRecord.id,
    customer_id: caseRecord.customer_id
  };
}

export async function sendSms(caseRecord, message) {
  return {
    channel: 'sms',
    status: 'sent',
    timestamp: new Date().toISOString(),
    message,
    case_id: caseRecord.id,
    customer_id: caseRecord.customer_id
  };
}

export async function sendEmail(caseRecord, message) {
  return {
    channel: 'email',
    status: 'sent',
    timestamp: new Date().toISOString(),
    message,
    case_id: caseRecord.id,
    customer_id: caseRecord.customer_id
  };
}
