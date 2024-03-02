<script setup lang="ts">
import { onMounted, ref } from "vue";
import destr from "destr";

const props = defineProps<{
  user: import("lucia").User;
}>();

const keys = ["short", "target", "uses", "max_uses", "expiration"] as const;

const urls = ref<ShortenedUrl[]>([]);
const message = ref<string>();
const origin = ref<string>();

onMounted(async () => {
  origin.value = location.origin;
  await refreshUrls();
});

async function refreshUrls() {
  const res = await fetch("/api/list").then((r) => r.text());
  urls.value = destr(res);
}

async function submit(e: Event) {
  e.preventDefault();

  // uku makes worst function ever, asked to leave
  let obj = (() => {
    const data = Object.fromEntries(new FormData(e.target as HTMLFormElement));
    const entries = Object.entries(data).filter(([, value]) => value);
    return Object.fromEntries(entries);
  })();

  const res = await fetch("/api/register", {
    method: "POST",
    body: JSON.stringify(obj),
  });

  const text = await res.text();
  if (res.ok) {
    const url = location.origin + "/" + text;
    navigator.clipboard.writeText(url);
    message.value = `Shortened to ${url} (copied to clipboard)`;
    await refreshUrls();
  } else {
    message.value = `Error (${res.status}): ${text}`;
  }
}

async function deleteUrl(short: string) {
  let res = await fetch("/api/remove", {
    method: "DELETE",
    body: JSON.stringify({ name: short }),
  });

  const text = await res.text();
  if (res.ok) {
    urls.value = urls.value.filter((url) => url.short !== short);
    message.value = `Successfully deleted ${short}!`;
  } else {
    message.value = `Error (${res.status}): ${text}`;
  }
}
</script>

<template>
  <h1>Shortage</h1>

  Hello {{ props.user.username }} | <a href="/logout">Logout</a>

  <p v-if="message">
    <i>{{ message }}</i>
  </p>

  <h2>Register</h2>

  <form @submit="submit">
    <label>
      Target URL (required): <input type="url" name="target" required />
    </label>

    <label>Name: <input type="text" name="name" minlength="2" /></label>

    <label>Expiration: <input type="date" name="expiration" /></label>

    <label>Max uses: <input type="number" name="max_uses" /></label>

    <input type="submit" value="Register" />
  </form>

  <h2>Manage</h2>

  <table>
    <tr>
      <th
        v-for="key in [
          'Short',
          'Target',
          'Uses',
          'Max Uses',
          'Expiration',
          'Actions',
        ]"
        :key="key"
      >
        {{ key }}
      </th>
    </tr>

    <tr v-for="url in urls" :key="url.short">
      <td v-for="key in keys" :key="key">{{ url[key] }}</td>
      <td>
        <button @click="deleteUrl(url.short)">Delete</button>
      </td>
    </tr>
  </table>
</template>

<style scoped>
label {
  display: block;
  position: relative;
  margin-bottom: 0.5rem;
}

td,
th {
  border: 1px solid black;
  padding: 5px;
}

table {
  border-collapse: collapse;
}
</style>
