export function validateKondisiStatus(kondisi, status) {
  if (kondisi === 'Rusak Berat' && status === 'Tersedia') {
    return {
      ok: false,
      error: 'Kondisi Rusak Berat tidak bisa berstatus Tersedia. Pilih Tidak Tersedia, Hilang, atau Diarsipkan.',
    };
  }
  if (kondisi === 'Rusak Berat' && status === 'Sebagian Rusak') {
    return {
      ok: false,
      error: 'Kondisi Rusak Berat tidak sesuai dengan status Sebagian Rusak.',
    };
  }
  if (kondisi === 'Baik' && status === 'Sebagian Rusak') {
    return {
      ok: false,
      error: 'Kondisi Baik tidak sesuai dengan status Sebagian Rusak.',
    };
  }
  if (kondisi === 'Cukup Baik' && status === 'Tidak Tersedia') {
    return {
      ok: false,
      error: 'Kondisi Cukup Baik masih dapat dipakai. Gunakan Tersedia, atau ubah kondisi jika koleksi memang tidak dapat digunakan.',
    };
  }
  return { ok: true };
}

export function suggestedStatus(kondisi) {
  if (kondisi === 'Rusak Berat') return 'Tidak Tersedia';
  if (kondisi === 'Rusak Ringan') return 'Sebagian Rusak';
  return 'Tersedia';
}

export function allowedStatuses(kondisi, allStatuses) {
  return allStatuses.filter((status) => validateKondisiStatus(kondisi, status).ok);
}
