export function digitsOnly(isbn) {
  return String(isbn || '')
    .replace(/[^0-9Xx]/g, '')
    .toUpperCase();
}

export function isbn13Checksum(d12) {
  let sum = 0;
  for (let i = 0; i < 12; i += 1) {
    sum += Number(d12[i]) * (i % 2 === 0 ? 1 : 3);
  }
  return String((10 - (sum % 10)) % 10);
}

export function isbn10Checksum(d9) {
  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number(d9[i]) * (10 - i);
  }
  const rem = sum % 11;
  const check = (11 - rem) % 11;
  return check === 10 ? 'X' : String(check);
}

export function validateIsbn(isbn) {
  const d = digitsOnly(isbn);
  if (d.length === 13) {
    if (d.slice(0, 3) !== '978' && d.slice(0, 3) !== '979') {
      return { ok: false, error: 'ISBN-13 harus berawalan 978 atau 979' };
    }
    if (d[12] !== isbn13Checksum(d.slice(0, 12))) {
      return { ok: false, error: 'Angka periksa ISBN-13 tidak valid' };
    }
    return { ok: true, normalized: d };
  }
  if (d.length === 10) {
    if (d[9] !== isbn10Checksum(d.slice(0, 9))) {
      return { ok: false, error: 'Angka periksa ISBN-10 tidak valid' };
    }
    return { ok: true, normalized: d };
  }
  return { ok: false, error: 'ISBN harus 10 atau 13 digit' };
}

/** Digit ISBN dari query pencarian, atau string kosong jika terlalu pendek. */
export function isbnLookupNeedle(query, minDigits = 3) {
  const d = digitsOnly(query);
  return d.length >= minDigits ? d : '';
}

/** Bentuk digit ISBN tersimpan, termasuk data lama yang masih berstrip. */
export function isbnDigitsSql(column = 'isbn') {
  return `REPLACE(REPLACE(REPLACE(UPPER(${column}), '-', ''), ' ', ''), '.', '')`;
}

/** Perbaiki digit terakhir agar lolos checksum, pertahankan tanda hubung. */
export function withValidChecksum(isbn) {
  const raw = String(isbn || '').trim();
  const d = digitsOnly(raw);
  if (d.length >= 12) {
    const body = d.slice(0, 12);
    const full = body + isbn13Checksum(body);
    if (!raw) return full;
    const lastDigitIndex = [...raw].findLastIndex((ch) => /[0-9]/.test(ch));
    if (lastDigitIndex >= 0) {
      return `${raw.slice(0, lastDigitIndex)}${full[12]}${raw.slice(lastDigitIndex + 1)}`;
    }
    return full;
  }
  return raw;
}
