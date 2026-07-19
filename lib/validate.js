function validateContact(body) {
  var errors = [];
  var name = (body.name || '').trim();
  var email = (body.email || '').trim();
  var subject = (body.subject || '').trim();
  var message = (body.message || '').trim();

  if (!name || name.length < 2 || name.length > 100) {
    errors.push({ field: 'name', message: 'Name must be between 2 and 100 characters' });
  }
  if (!/^[a-zA-Z\u00C0-\u024F\u0600-\u06FF\s'-]+$/.test(name)) {
    errors.push({ field: 'name', message: 'Name contains invalid characters' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }
  if (subject && subject.length > 200) {
    errors.push({ field: 'subject', message: 'Subject must be under 200 characters' });
  }
  if (!message || message.length < 10 || message.length > 5000) {
    errors.push({ field: 'message', message: 'Message must be between 10 and 5000 characters' });
  }

  return errors;
}

function validateNewsletter(body) {
  var errors = [];
  var email = (body.email || '').trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }

  return errors;
}

function validateAnalytics(body) {
  var errors = [];
  var eventType = (body.event_type || '').trim();
  var validTypes = ['pageview', 'click', 'scroll', 'cta_click', 'form_open', 'form_submit'];

  if (!eventType || validTypes.indexOf(eventType) === -1) {
    errors.push({ field: 'event_type', message: 'Invalid event type' });
  }
  if (body.page_path && body.page_path.length > 500) {
    errors.push({ field: 'page_path', message: 'Page path too long' });
  }
  if (body.referrer && body.referrer.length > 2000) {
    errors.push({ field: 'referrer', message: 'Referrer too long' });
  }
  if (body.metadata && typeof body.metadata !== 'object') {
    errors.push({ field: 'metadata', message: 'Metadata must be an object' });
  }

  return errors;
}

module.exports = {
  validateContact: validateContact,
  validateNewsletter: validateNewsletter,
  validateAnalytics: validateAnalytics,
};
