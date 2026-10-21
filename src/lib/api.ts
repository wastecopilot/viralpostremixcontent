"use client";

// Calls our own server routes (never Google directly — the key stays on the server).

export async function callApi<T>(path: string, body: unknown): Promise<T & { demo?: boolean }> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Could not connect. Check your internet connection and that the app is still running.");
  }
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    if (res.status === 413) throw new Error("That file is too big to send. Please use a smaller image.");
    const message =
      data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : `Something went wrong (error ${res.status}). Please try again.`;
    throw new Error(message);
  }
  return data as T & { demo?: boolean };
}
