const BASE_URL = "https://api.api-ninjas.com/v1";

export async function fetchExercisesByMuscle(muscle) {
  const apiKey = import.meta.env.VITE_API_NINJAS_KEY;

  if (!apiKey) {
    throw new Error("Missing VITE_API_NINJAS_KEY in .env");
  }
  const response = await fetch(
    `${BASE_URL}/exercises?muscle=${encodeURIComponent(muscle)}`,
    {
      headers: {
        "X-Api-Key": apiKey,
      },
    }
  );
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}