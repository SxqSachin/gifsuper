import { Base64 } from 'js-base64';

const ca = Base64.atob;

export function checkOrigin() {
  const origins = 'aHR0cHM6Ly93d3cuZ2lmc3VwZXIuY29tbc27c69aHR0cHM6Ly9naWZzdXBlci5jb20=bc27c69aHR0cDovL2xvY2FsaG9zdDo4MDgy';
  const target = 'YUhSMGNITTZMeTluYVdaemRYQmxjaTVqYjIwPQ==';
  try {
    if (!origins.split('bc27c69').map(arg => ca(arg)).includes(location.origin)) {
      location.href = ca(target);
    }
  } catch {
    location.href = ca(ca(target));
  }
}
