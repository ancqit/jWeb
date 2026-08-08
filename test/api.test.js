import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { after, before, describe, it } from "node:test";

const port = 3456;
let child;

before(async () => {
  child = spawn(process.execPath, ["src/server.js"], {
    env: { ...process.env, PORT: String(port), HOST: "127.0.0.1" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Server did not start")), 5000);
    child.stdout.on("data", (chunk) => {
      if (chunk.toString().includes("listening")) {
        clearTimeout(timeout);
        resolve();
      }
    });
    child.on("error", reject);
  });
});

after(async () => {
  if (child && !child.killed) {
    child.kill("SIGTERM");
    await once(child, "exit");
  }
});

describe("jWeb API", () => {
  it("returns health status", async () => {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.ok, true);
    assert.equal(body.service, "jweb");
  });

  it("creates and lists items", async () => {
    const create = await fetch(`http://127.0.0.1:${port}/api/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Test item" }),
    });
    assert.equal(create.status, 201);

    const list = await fetch(`http://127.0.0.1:${port}/api/items`);
    assert.equal(list.status, 200);
    const body = await list.json();
    assert.ok(body.items.some((item) => item.text === "Test item"));
  });
});
