const form = document.querySelector("#item-form");
const input = document.querySelector("#item-input");
const list = document.querySelector("#item-list");
const emptyState = document.querySelector("#empty-state");
const status = document.querySelector("#status");

async function loadItems() {
  const response = await fetch("/api/items");
  const data = await response.json();
  list.replaceChildren();

  if (data.items.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  for (const item of data.items) {
    const li = document.createElement("li");
    li.textContent = item.text;
    list.append(li);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) {
    return;
  }

  status.textContent = "Saving…";
  const response = await fetch("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    status.textContent = "Could not save item.";
    return;
  }

  input.value = "";
  status.textContent = "Item saved.";
  await loadItems();
});

loadItems().catch(() => {
  status.textContent = "Could not load items.";
});
