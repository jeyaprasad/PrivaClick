export function validateAadhaarChecksum(aadhaar: string): { valid: boolean; reason?: string } {
  if (!/^\d{12}$/.test(aadhaar)) {
    return { valid: false, reason: "Aadhaar must be exactly 12 digits." };
  }

  const d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
  ];

  const p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
  ];

  let c = 0;
  const reversed = aadhaar.split('').reverse().map(Number);
  
  for (let i = 0; i < reversed.length; i++) {
    c = d[c][p[i % 8][reversed[i]]];
  }

  if (c === 0) {
    return { valid: true };
  }
  
  return { valid: false, reason: "Aadhaar number failed checksum validation." };
}

export function validatePAN(pan: string): { valid: boolean; reason?: string } {
  const upperPan = pan.toUpperCase();
  
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(upperPan)) {
    return { valid: false, reason: "PAN must be in the format: 5 letters, 4 numbers, 1 letter." };
  }
  
  const holderType = upperPan[3];
  const validTypes = ['P', 'C', 'H', 'F', 'A', 'T', 'B', 'L', 'J', 'G'];
  
  if (!validTypes.includes(holderType)) {
    return { valid: false, reason: `Invalid 4th character '${holderType}'. It must denote holder type (e.g., P for Person, C for Company).` };
  }
  
  return { valid: true };
}

export function validatePassport(passport: string): { valid: boolean; reason?: string } {
  const upperPass = passport.toUpperCase();
  if (!/^[A-Z][1-9]\d\s?\d{4}[1-9]$/.test(upperPass)) {
    return { valid: false, reason: "Passport must be 1 letter followed by 7 digits." };
  }
  return { valid: true };
}

export function validateVoterId(voter: string): { valid: boolean; reason?: string } {
  const upperVoter = voter.toUpperCase();
  if (!/^[A-Z]{3}[0-9]{7}$/.test(upperVoter)) {
    return { valid: false, reason: "Voter ID must be exactly 3 letters followed by 7 digits." };
  }
  return { valid: true };
}
