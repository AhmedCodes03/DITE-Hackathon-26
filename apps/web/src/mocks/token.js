function encodeText(value) {
  if (typeof window !== "undefined" && window.btoa) {
    return window.btoa(value);
  }

  return Buffer.from(value, "utf8").toString("base64");
}

function decodeText(value) {
  if (typeof window !== "undefined" && window.atob) {
    return window.atob(value);
  }

  return Buffer.from(value, "base64").toString("utf8");
}

export function createMockToken(user) {
  const payload = {
    id: user.id,
    role: user.role,
    fullName: user.fullName,
    email: user.email,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7
  };

  return `mock.${encodeText(JSON.stringify(payload))}`;
}

export function parseMockToken(token) {
  if (!token || !token.startsWith("mock.")) return null;

  try {
    const encodedPayload = token.split(".")[1] || "";
    return JSON.parse(decodeText(encodedPayload));
  } catch {
    return null;
  }
}
