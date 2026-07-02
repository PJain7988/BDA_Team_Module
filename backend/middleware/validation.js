// backend/middleware/validation.js
/**
 * Request validation middleware using manual checks
 * Provides clean validation errors with field-level detail
 */

/**
 * Sanitize a string field (trim & remove HTML tags)
 */
const sanitize = (value) => {
  if (typeof value !== 'string') return value;
  return value.trim().replace(/<[^>]*>/g, '');
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (digits, spaces, dashes, +)
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[\d\s\-().]{7,20}$/;
  return phoneRegex.test(phone);
};

/**
 * Build a validation error response
 */
const validationError = (res, errors) => {
  return res.status(422).json({
    status: 'fail',
    code: 'VALIDATION_ERROR',
    message: 'Validation failed. Please fix the following errors.',
    errors,
  });
};

/**
 * Validate login request
 */
const validateLogin = (req, res, next) => {
  const errors = {};
  const { email, password } = req.body;

  if (!email || !email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.';
  }

  if (Object.keys(errors).length > 0) {
    return validationError(res, errors);
  }

  req.body.email = sanitize(email).toLowerCase();
  next();
};

/**
 * Validate registration request
 */
const validateRegister = (req, res, next) => {
  const errors = {};
  const { name, email, password, role } = req.body;

  if (!name || !name.trim()) {
    errors.name = 'Full name is required.';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long.';
  } else if (name.trim().length > 60) {
    errors.name = 'Name cannot exceed 60 characters.';
  }

  if (!email || !email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  } else if (!/[A-Z]/.test(password)) {
    errors.password = 'Password must contain at least one uppercase letter.';
  } else if (!/[0-9]/.test(password)) {
    errors.password = 'Password must contain at least one number.';
  }

  const validRoles = ['BDA', 'TeamLead', 'Manager'];
  if (role && !validRoles.includes(role)) {
    errors.role = `Role must be one of: ${validRoles.join(', ')}.`;
  }

  if (Object.keys(errors).length > 0) {
    return validationError(res, errors);
  }

  req.body.name  = sanitize(name).trim();
  req.body.email = sanitize(email).toLowerCase();
  next();
};

/**
 * Validate create/update lead request
 */
const validateLead = (req, res, next) => {
  const errors = {};
  const { companyName, contactName, email, dealValue, stage } = req.body;

  if (!companyName || !companyName.trim()) {
    errors.companyName = 'Company name is required.';
  } else if (companyName.trim().length < 2) {
    errors.companyName = 'Company name must be at least 2 characters.';
  }

  if (!contactName || !contactName.trim()) {
    errors.contactName = 'Contact name is required.';
  }

  if (email && !isValidEmail(email)) {
    errors.email = 'Please provide a valid email address for the contact.';
  }

  if (dealValue !== undefined && dealValue !== null) {
    const val = Number(dealValue);
    if (isNaN(val) || val < 0) {
      errors.dealValue = 'Deal value must be a non-negative number.';
    }
  }

  const validStages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
  if (stage && !validStages.includes(stage)) {
    errors.stage = `Stage must be one of: ${validStages.join(', ')}.`;
  }

  if (Object.keys(errors).length > 0) {
    return validationError(res, errors);
  }

  // Sanitize string fields
  if (req.body.companyName) req.body.companyName = sanitize(req.body.companyName);
  if (req.body.contactName) req.body.contactName = sanitize(req.body.contactName);
  if (req.body.notes)       req.body.notes       = sanitize(req.body.notes);

  next();
};

/**
 * Validate communication log entry
 */
const validateCommunication = (req, res, next) => {
  const errors = {};
  const { type, subject, description } = req.body;

  const validTypes = ['Call', 'Email', 'Meeting', 'Note', 'Demo'];
  if (!type || !validTypes.includes(type)) {
    errors.type = `Communication type must be one of: ${validTypes.join(', ')}.`;
  }

  if (!subject || !subject.trim()) {
    errors.subject = 'Subject is required.';
  } else if (subject.trim().length > 200) {
    errors.subject = 'Subject cannot exceed 200 characters.';
  }

  if (!description || !description.trim()) {
    errors.description = 'Description is required.';
  }

  if (Object.keys(errors).length > 0) {
    return validationError(res, errors);
  }

  if (req.body.subject)     req.body.subject     = sanitize(req.body.subject);
  if (req.body.description) req.body.description = sanitize(req.body.description);

  next();
};

/**
 * Generic object ID validation
 */
const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName];
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({
      status: 'fail',
      code: 'INVALID_ID',
      message: `Invalid ${paramName} format. Must be a valid MongoDB ObjectId.`,
    });
  }
  next();
};

module.exports = {
  validateLogin,
  validateRegister,
  validateLead,
  validateCommunication,
  validateObjectId,
  sanitize,
  isValidEmail,
  isValidPhone,
};
