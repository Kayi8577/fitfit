// Google Drive backup via the appDataFolder — a hidden, app-private area of
// the user's Drive (invisible in the Drive UI, minimal-permission scope).
//
// Pure-frontend apps cannot ship an OAuth secret, so the user supplies their
// own OAuth Client ID (see README「Google Drive 備份」for setup steps) and we
// use the Google Identity Services token flow. The site origin must be listed
// under "Authorized JavaScript origins" in Google Cloud Console, and the page
// must be served over HTTPS (localhost is exempt).

import { getDriveClientId } from '../config.js';

const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const FILE_NAME = 'fitfit-backup.json';

let accessToken = null;
let tokenExpiry = 0;

function loadGisScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error('無法載入 Google 登入元件（請檢查網路）'));
    document.head.appendChild(s);
  });
}

async function getToken() {
  if (accessToken && Date.now() < tokenExpiry - 60000) return accessToken;

  const clientId = getDriveClientId();
  if (!clientId) throw new Error('請先填入 Google Client ID（見 README 設定步驟）');
  await loadGisScript();

  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: res => {
        if (res.error) { reject(new Error(`Google 授權失敗：${res.error}`)); return; }
        accessToken = res.access_token;
        tokenExpiry = Date.now() + (res.expires_in || 3600) * 1000;
        resolve(accessToken);
      },
      error_callback: err => reject(new Error(err?.message || 'Google 授權視窗被關閉')),
    });
    client.requestAccessToken();
  });
}

async function driveFetch(url, opts = {}) {
  const token = await getToken();
  const res = await fetch(url, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });
  if (!res.ok) throw new Error(`Drive API 錯誤（${res.status}）`);
  return res;
}

async function findBackupFile() {
  const q = encodeURIComponent(`name='${FILE_NAME}'`);
  const res = await driveFetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id,modifiedTime)`
  );
  const data = await res.json();
  return data.files?.[0] || null;
}

// Uploads the snapshot, overwriting the previous backup if one exists.
// Returns the file's modifiedTime.
export async function backupToDrive(snapshot) {
  const existing = await findBackupFile();
  const metadata = existing ? { name: FILE_NAME } : { name: FILE_NAME, parents: ['appDataFolder'] };
  const boundary = 'fitfit_boundary_314159';
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: application/json',
    '',
    JSON.stringify(snapshot),
    `--${boundary}--`,
    '',
  ].join('\r\n');

  const url = existing
    ? `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=multipart&fields=modifiedTime`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=modifiedTime';

  const res = await driveFetch(url, {
    method: existing ? 'PATCH' : 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });
  return (await res.json()).modifiedTime;
}

// Downloads and returns the parsed backup snapshot. Throws if none exists.
export async function restoreFromDrive() {
  const existing = await findBackupFile();
  if (!existing) throw new Error('Google Drive 上還沒有備份');
  const res = await driveFetch(`https://www.googleapis.com/drive/v3/files/${existing.id}?alt=media`);
  return res.json();
}
