import colors from 'colors';

function createInfo(pending) {
  if (pending.length === 0) {
    return 'No pending migrations found, current environment is up to date.';
  }
  return `${pending.length} pending migrations found:`;
}

export default function listPending({ migrator }) {
  return migrator.getPending()
  .then((pending) => {
    const info = createInfo(pending);
    console.log();
    console.log(colors.grey(info));
    return pending;
  })
  .each(version => console.log(colors.grey(`- ${version}`)))
  .then((versions) => {
    console.log();
    return versions;
  });
}
