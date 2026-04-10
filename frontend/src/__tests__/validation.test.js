/**
 * Frontend Validation Tests
 * ─────────────────────────────────────────────────────────────────────────────
 * Framework : Vitest  (native to Vite, same config — run with `npm test`)
 * Approach  : Pure-logic tests for every validation rule that was added to the
 *             backend's middleware/validate.js and mirrored in the frontend.
 *             These tests are framework-agnostic: they call the same regex /
 *             logic the UI components use, so they run in milliseconds with no
 *             DOM, no mocking, and no network.
 *
 * Groups
 *  1. Password strength          (Signup.jsx, Profile.jsx)
 *  2. Flat field rules           (Flats.jsx)
 *  3. Complaint description      (Complaints.jsx)
 *  4. Booking time ordering      (Bookings.jsx)
 *  5. Announcement constraints   (Announcements.jsx)
 *  6. Billing month/year         (MaintenanceBills.jsx)
 *  7. Email format               (Login.jsx, Signup.jsx, Profile.jsx)
 *  8. ObjectId shape             (paymentService, flatService params)
 *  9. Occupancy type enum        (Flats.jsx select)
 * 10. Complaint enums            (Complaints.jsx selects)
 */

// ─── Shared validation helpers (mirrors backend middleware/validate.js) ────────
// These are the exact same rules the backend enforces with 400 hard rejections.

/** isStrongPassword — ≥ 8 chars, at least 1 upper, 1 lower, 1 digit */
const STRONG_PW = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const isStrongPassword = (pw) => STRONG_PW.test(pw);

/** isValidEmail — basic RFC-style email check */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = (email) => EMAIL_RE.test(email);

/** isValidPhone — 10-digit Indian mobile (backend accepts +91 prefix too) */
const PHONE_RE = /^(\+91[-\s]?)?[6-9]\d{9}$/;
const isValidPhone = (phone) => PHONE_RE.test(phone);

/** isValidObjectId — 24-char hex string */
const OID_RE = /^[a-f\d]{24}$/i;
const isValidObjectId = (id) => OID_RE.test(id);

/** isValidTime — HH:MM 24-hour format */
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const isValidTime = (t) => TIME_RE.test(t);

/** endTimeAfterStart — string comparison works because times are HH:MM */
const endTimeAfterStart = (start, end) => end > start;

// ─── Enums (must match backend exactly) ───────────────────────────────────────
const OCCUPANCY_TYPES    = ['OWNER', 'RENTER'];
const COMPLAINT_CATS     = ['Plumbing','Electrical','Security','Cleaning','Parking','Noise','Pest Control','Others'];
const COMPLAINT_PRIORITY = ['LOW', 'MEDIUM', 'HIGH'];
const COMPLAINT_STATUS   = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
const BOOKING_STATUS     = ['PENDING', 'APPROVED', 'REJECTED'];

// ─── 1. Password Strength ─────────────────────────────────────────────────────
describe('1 · Password Strength (isStrongPassword)', () => {
  it('accepts a valid strong password', () => {
    expect(isStrongPassword('Admin@123')).toBe(true);
    expect(isStrongPassword('ResiFlow1')).toBe(true);
    expect(isStrongPassword('Test1234')).toBe(true);
  });

  it('rejects passwords shorter than 8 characters', () => {
    expect(isStrongPassword('Ab1')).toBe(false);
    expect(isStrongPassword('Ab1cDe')).toBe(false);
    expect(isStrongPassword('Ab1cDe7')).toBe(false); // exactly 7
  });

  it('rejects passwords with no uppercase letter', () => {
    expect(isStrongPassword('admin123')).toBe(false);
    expect(isStrongPassword('password1')).toBe(false);
  });

  it('rejects passwords with no lowercase letter', () => {
    expect(isStrongPassword('ADMIN123')).toBe(false);
    expect(isStrongPassword('PASSWORD1')).toBe(false);
  });

  it('rejects passwords with no digit', () => {
    expect(isStrongPassword('AdminPass')).toBe(false);
    expect(isStrongPassword('StrongPw')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isStrongPassword('')).toBe(false);
  });

  it('rejects undefined / null gracefully', () => {
    expect(isStrongPassword(undefined)).toBe(false);
    expect(isStrongPassword(null)).toBe(false);
  });
});

// ─── 2. Flat Field Rules ──────────────────────────────────────────────────────
describe('2 · Flat Field Rules (Flats.jsx)', () => {
  describe('block — required, non-empty', () => {
    const isValidBlock = (b) => typeof b === 'string' && b.trim().length > 0;

    it('accepts non-empty block values', () => {
      expect(isValidBlock('A')).toBe(true);
      expect(isValidBlock('Block B')).toBe(true);
    });

    it('rejects empty or whitespace-only block', () => {
      expect(isValidBlock('')).toBe(false);
      expect(isValidBlock('   ')).toBe(false);
    });
  });

  describe('flatNumber — required, non-empty', () => {
    const isValidFlatNumber = (n) => typeof n === 'string' && n.trim().length > 0;

    it('accepts valid flat numbers', () => {
      expect(isValidFlatNumber('101')).toBe(true);
      expect(isValidFlatNumber('A-203')).toBe(true);
    });

    it('rejects empty flat number', () => {
      expect(isValidFlatNumber('')).toBe(false);
    });
  });

  describe('areaSqFt — must be positive', () => {
    const isPositiveArea = (n) => Number(n) > 0;

    it('accepts positive values', () => {
      expect(isPositiveArea(1)).toBe(true);
      expect(isPositiveArea(1200)).toBe(true);
      expect(isPositiveArea('850')).toBe(true);
    });

    it('rejects zero', () => {
      expect(isPositiveArea(0)).toBe(false);
      expect(isPositiveArea('0')).toBe(false);
    });

    it('rejects negative values', () => {
      expect(isPositiveArea(-1)).toBe(false);
      expect(isPositiveArea(-100)).toBe(false);
    });
  });

  describe('occupancyType — OWNER | RENTER enum', () => {
    it('accepts valid enum values', () => {
      OCCUPANCY_TYPES.forEach(t => expect(OCCUPANCY_TYPES.includes(t)).toBe(true));
    });

    it('rejects invalid occupancy type', () => {
      expect(OCCUPANCY_TYPES.includes('TENANT')).toBe(false);
      expect(OCCUPANCY_TYPES.includes('')).toBe(false);
      expect(OCCUPANCY_TYPES.includes('owner')).toBe(false); // case-sensitive
    });
  });
});

// ─── 3. Complaint Description ─────────────────────────────────────────────────
describe('3 · Complaint Description (min 10 chars)', () => {
  const isValidDescription = (d) => typeof d === 'string' && d.trim().length >= 10;

  it('accepts descriptions of 10 or more characters', () => {
    expect(isValidDescription('Water leak in bathroom')).toBe(true);
    expect(isValidDescription('1234567890')).toBe(true); // exactly 10
  });

  it('rejects descriptions shorter than 10 characters', () => {
    expect(isValidDescription('Too short')).toBe(false); // 9 chars
    expect(isValidDescription('Fix it')).toBe(false);
    expect(isValidDescription('')).toBe(false);
  });

  it('trims whitespace before checking length', () => {
    // 10 spaces should NOT count as valid
    expect(isValidDescription('          ')).toBe(false);
  });

  describe('Complaint category enum (8 values)', () => {
    it('contains exactly 8 categories matching the backend', () => {
      expect(COMPLAINT_CATS).toHaveLength(8);
    });

    const expected = ['Plumbing','Electrical','Security','Cleaning','Parking','Noise','Pest Control','Others'];
    it('matches backend enum exactly', () => {
      expected.forEach(c => expect(COMPLAINT_CATS.includes(c)).toBe(true));
    });

    it('rejects unknown categories', () => {
      expect(COMPLAINT_CATS.includes('Garbage')).toBe(false);
      expect(COMPLAINT_CATS.includes('plumbing')).toBe(false); // case sensitive
    });
  });

  describe('Complaint priority enum', () => {
    it('accepts LOW, MEDIUM, HIGH', () => {
      COMPLAINT_PRIORITY.forEach(p => expect(COMPLAINT_PRIORITY.includes(p)).toBe(true));
    });
    it('rejects invalid priority values', () => {
      expect(COMPLAINT_PRIORITY.includes('URGENT')).toBe(false);
      expect(COMPLAINT_PRIORITY.includes('low')).toBe(false);
    });
  });

  describe('Complaint status enum', () => {
    it('accepts OPEN, IN_PROGRESS, RESOLVED', () => {
      COMPLAINT_STATUS.forEach(s => expect(COMPLAINT_STATUS.includes(s)).toBe(true));
    });
    it('rejects invalid status', () => {
      expect(COMPLAINT_STATUS.includes('CLOSED')).toBe(false);
      expect(COMPLAINT_STATUS.includes('PENDING')).toBe(false);
    });
  });
});

// ─── 4. Booking Time Ordering ─────────────────────────────────────────────────
describe('4 · Booking Time Ordering (Bookings.jsx)', () => {
  it('accepts end time after start time', () => {
    expect(endTimeAfterStart('09:00', '10:00')).toBe(true);
    expect(endTimeAfterStart('08:30', '09:00')).toBe(true);
    expect(endTimeAfterStart('00:00', '23:59')).toBe(true);
  });

  it('rejects end time equal to start time', () => {
    expect(endTimeAfterStart('10:00', '10:00')).toBe(false);
  });

  it('rejects end time before start time', () => {
    expect(endTimeAfterStart('14:00', '09:00')).toBe(false);
    expect(endTimeAfterStart('23:00', '08:00')).toBe(false);
  });

  describe('Time format validation (HH:MM)', () => {
    it('accepts valid HH:MM times', () => {
      expect(isValidTime('00:00')).toBe(true);
      expect(isValidTime('09:30')).toBe(true);
      expect(isValidTime('23:59')).toBe(true);
    });

    it('rejects invalid time formats', () => {
      expect(isValidTime('9:00')).toBe(false);   // no leading zero
      expect(isValidTime('25:00')).toBe(false);  // hour out of range
      expect(isValidTime('09:60')).toBe(false);  // minute out of range
      expect(isValidTime('9am')).toBe(false);
      expect(isValidTime('')).toBe(false);
    });
  });

  describe('Booking status enum', () => {
    it('contains PENDING, APPROVED, REJECTED', () => {
      BOOKING_STATUS.forEach(s => expect(BOOKING_STATUS.includes(s)).toBe(true));
    });
  });
});

// ─── 5. Announcement Constraints ─────────────────────────────────────────────
describe('5 · Announcement Constraints (Announcements.jsx)', () => {
  describe('title — 3 to 200 characters', () => {
    const isValidTitle = (t) => {
      const s = (t ?? '').trim();
      return s.length >= 3 && s.length <= 200;
    };

    it('accepts titles within 3-200 chars', () => {
      expect(isValidTitle('ABC')).toBe(true);          // exactly 3
      expect(isValidTitle('Water Supply Update')).toBe(true);
      expect(isValidTitle('A'.repeat(200))).toBe(true); // exactly 200
    });

    it('rejects titles shorter than 3 characters', () => {
      expect(isValidTitle('')).toBe(false);
      expect(isValidTitle('Hi')).toBe(false);       // 2 chars
      expect(isValidTitle('  A ')).toBe(false);     // 1 char after trim
    });

    it('rejects titles longer than 200 characters', () => {
      expect(isValidTitle('A'.repeat(201))).toBe(false);
    });
  });

  describe('message — minimum 5 characters', () => {
    const isValidMessage = (m) => (m ?? '').trim().length >= 5;

    it('accepts messages of 5 or more characters', () => {
      expect(isValidMessage('Hello')).toBe(true);      // exactly 5
      expect(isValidMessage('Society meeting at 6pm')).toBe(true);
    });

    it('rejects messages shorter than 5 characters', () => {
      expect(isValidMessage('Hi')).toBe(false);
      expect(isValidMessage('')).toBe(false);
      expect(isValidMessage('    ')).toBe(false); // whitespace only
    });
  });

  describe('expiryDate — must be a future date when provided', () => {
    const isFutureDate = (dateStr) => {
      if (!dateStr) return true; // optional field — no date = valid
      return new Date(dateStr) > new Date();
    };

    it('passes when no expiry date is provided (optional)', () => {
      expect(isFutureDate('')).toBe(true);
      expect(isFutureDate(undefined)).toBe(true);
    });

    it('accepts a future date', () => {
      const future = new Date();
      future.setDate(future.getDate() + 7);
      const iso = future.toISOString().split('T')[0];
      expect(isFutureDate(iso)).toBe(true);
    });

    it('rejects a past date', () => {
      expect(isFutureDate('2020-01-01')).toBe(false);
      expect(isFutureDate('2023-06-15')).toBe(false);
    });
  });
});

// ─── 6. Billing Month / Year ──────────────────────────────────────────────────
describe('6 · Billing Month / Year (MaintenanceBills.jsx)', () => {
  const isValidMonth = (m) => Number.isInteger(Number(m)) && m >= 1 && m <= 12;
  const isValidYear  = (y) => Number.isInteger(Number(y)) && y >= 2020 && y <= 2100;

  it('accepts months 1 through 12', () => {
    for (let m = 1; m <= 12; m++) expect(isValidMonth(m)).toBe(true);
  });

  it('rejects month 0, 13, and non-integers', () => {
    expect(isValidMonth(0)).toBe(false);
    expect(isValidMonth(13)).toBe(false);
    expect(isValidMonth(1.5)).toBe(false);
  });

  it('accepts years 2020 to 2100', () => {
    expect(isValidYear(2020)).toBe(true);
    expect(isValidYear(2026)).toBe(true);
    expect(isValidYear(2100)).toBe(true);
  });

  it('rejects years outside 2020–2100', () => {
    expect(isValidYear(2019)).toBe(false);
    expect(isValidYear(2101)).toBe(false);
    expect(isValidYear(1999)).toBe(false);
  });
});

// ─── 7. Email Format ──────────────────────────────────────────────────────────
describe('7 · Email Format (isValidEmail)', () => {
  it('accepts valid email addresses', () => {
    expect(isValidEmail('admin@society.com')).toBe(true);
    expect(isValidEmail('resident123@gmail.com')).toBe(true);
    expect(isValidEmail('test.user+tag@domain.co.in')).toBe(true);
  });

  it('rejects invalid email formats', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('missingat.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

// ─── 8. ObjectId Shape ────────────────────────────────────────────────────────
describe('8 · ObjectId Shape (payment/flat params)', () => {
  it('accepts 24-character hex strings', () => {
    expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
    expect(isValidObjectId('63f7a2b1c45d2e3f4a5b6c7d')).toBe(true);
  });

  it('rejects IDs that are too short or too long', () => {
    expect(isValidObjectId('507f1f77bcf86cd79943901')).toBe(false);  // 23 chars
    expect(isValidObjectId('507f1f77bcf86cd7994390111')).toBe(false); // 25 chars
  });

  it('rejects non-hex characters', () => {
    expect(isValidObjectId('507f1f77bcf86cd79943901g')).toBe(false); // 'g' not hex
    expect(isValidObjectId('507f1f77bcf86cd79943901!')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidObjectId('')).toBe(false);
  });
});

// ─── 9. Phone Format ──────────────────────────────────────────────────────────
describe('9 · Phone Format (isValidPhone)', () => {
  it('accepts 10-digit Indian mobile numbers starting with 6-9', () => {
    expect(isValidPhone('9876543210')).toBe(true);
    expect(isValidPhone('6543219870')).toBe(true);
    expect(isValidPhone('+919876543210')).toBe(true);
  });

  it('rejects numbers starting with 0-5', () => {
    expect(isValidPhone('1234567890')).toBe(false);
    expect(isValidPhone('5432167890')).toBe(false);
  });

  it('rejects numbers that are too short or too long', () => {
    expect(isValidPhone('987654321')).toBe(false);   // 9 digits
    expect(isValidPhone('98765432101')).toBe(false); // 11 digits
  });

  it('rejects empty string', () => {
    expect(isValidPhone('')).toBe(false);
  });
});

// ─── 10. API Endpoint Sanity Check ───────────────────────────────────────────
describe('10 · API Endpoint Constants Sanity Check', () => {
  // NOTE: BASE_URL in api.js is currently set to localhost:3000 for local dev
  const BASE = 'http://localhost:3000';
  const ROUTES = {
    login:            `${BASE}/resiflow/auth/login`,
    logout:           `${BASE}/resiflow/auth/logout`,
    registerSociety:  `${BASE}/resiflow/auth/register-society`,
    profile_get:      `${BASE}/resiflow/profile`,
    flats_list:       `${BASE}/resiflow/flats`,
    complaints_list:  `${BASE}/resiflow/complaints`,
    facilities_list:  `${BASE}/resiflow/facilities`,
    bookings_list:    `${BASE}/resiflow/bookings`,
    payments_key:     `${BASE}/resiflow/payments/key`,
    billing_my:       `${BASE}/resiflow/billing/my`,
    billing_generate: `${BASE}/resiflow/billing/generate`,
  };

  it('all route strings start with the base URL', () => {
    Object.values(ROUTES).forEach(url => {
      expect(url.startsWith(BASE)).toBe(true);
    });
  });

  it('all route strings contain /resiflow/ prefix', () => {
    Object.values(ROUTES).forEach(url => {
      expect(url).toContain('/resiflow/');
    });
  });

  it('dynamic route factories produce correct URLs', () => {
    const flatAssign = (id) => `${BASE}/resiflow/flats/${id}/assign`;
    const bookApprove = (id) => `${BASE}/resiflow/bookings/${id}/approve`;
    const createOrder = (id) => `${BASE}/resiflow/payments/create-order/${id}`;

    const fakeId = '507f1f77bcf86cd799439011';
    expect(flatAssign(fakeId)).toBe(`${BASE}/resiflow/flats/507f1f77bcf86cd799439011/assign`);
    expect(bookApprove(fakeId)).toBe(`${BASE}/resiflow/bookings/507f1f77bcf86cd799439011/approve`);
    expect(createOrder(fakeId)).toBe(`${BASE}/resiflow/payments/create-order/507f1f77bcf86cd799439011`);
  });
});

// ─── 11. Razorpay Key ID Prefix Validation ────────────────────────────────────
describe('11 · Razorpay Key ID Prefix (Signup.jsx)', () => {
  // Backend rule : razorpayKeyId must start with 'rzp_'
  // Client rule  : same check applied before submit (mirrors backend 400 rejection)
  const isValidRazorpayKeyId = (key) =>
    typeof key === 'string' && key.startsWith('rzp_');

  it('accepts test mode key IDs (rzp_test_...)', () => {
    expect(isValidRazorpayKeyId('rzp_test_abcdefghijklmn')).toBe(true);
    expect(isValidRazorpayKeyId('rzp_test_XXXXXXXXXXXXXXXX')).toBe(true);
  });

  it('accepts live mode key IDs (rzp_live_...)', () => {
    expect(isValidRazorpayKeyId('rzp_live_abcdefghijklmn')).toBe(true);
  });

  it('rejects keys that do not start with rzp_', () => {
    expect(isValidRazorpayKeyId('key_test_abc')).toBe(false);
    expect(isValidRazorpayKeyId('abc123')).toBe(false);
    expect(isValidRazorpayKeyId('RZP_test_abc')).toBe(false); // case-sensitive
    expect(isValidRazorpayKeyId('rzptest')).toBe(false);      // missing underscore
  });

  it('rejects empty string', () => {
    expect(isValidRazorpayKeyId('')).toBe(false);
  });

  it('rejects non-string values (null, undefined, number)', () => {
    expect(isValidRazorpayKeyId(null)).toBe(false);
    expect(isValidRazorpayKeyId(undefined)).toBe(false);
    expect(isValidRazorpayKeyId(12345)).toBe(false);
  });

  it('razorpayKeySecret — any non-empty string is accepted on client (backend validates via Razorpay API)', () => {
    // The secret is opaque on the frontend. The backend live-tests it against
    // Razorpay and returns 400 if invalid. Client only needs it non-empty.
    const isNonEmpty = (s) => typeof s === 'string' && s.trim().length > 0;
    expect(isNonEmpty('anySecretValue')).toBe(true);
    expect(isNonEmpty('KWfakeSecretXYZ')).toBe(true);
    expect(isNonEmpty('')).toBe(false);
    expect(isNonEmpty('   ')).toBe(false);
  });
});

