function generateUniqueUserName(name) {
  const baseUsername = name
    .replace(/[^a-zA-Z0-9]/g, "")
    .replace(" ", "")
    .toLowerCase();
  const currentDateTime = new Date();
  const suffix = currentDateTime
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(-10);
  console.log(
    `currentDateTime :: ${currentDateTime.toISOString()} && suffix :: ${suffix}`
  );

  // Combine the base username and the datetime-based suffix
  const username = `${baseUsername}-${suffix}`;

  return username.slice(0, 16);
}

module.exports = generateUniqueUserName;
