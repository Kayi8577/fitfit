// 更多 → AI 設定 & 資料備份（匯出/匯入 JSON、Google Drive）。

import { getApiKey, setApiKey, getDriveClientId, setDriveClientId } from '../config.js';
import { exportSnapshot, importSnapshot } from '../core/storage.js';
import { bus } from '../core/events.js';
import { $ } from '../utils/dom.js';
import { backupToDrive, restoreFromDrive } from '../services/drive.js';
import { toast } from './feedback.js';

const LAST_BACKUP_KEY = 'fitfit_last_drive_backup';

export function initSettings() {
  $('set-api-key').value = getApiKey();
  $('set-gdrive-id').value = getDriveClientId();
  $('import-file').addEventListener('change', handleImportFile);
  renderBackupStatus();
}

export function saveAiKey() {
  setApiKey($('set-api-key').value.trim());
  toast(getApiKey() ? '✓ API Key 已儲存（只存在此裝置）' : 'API Key 已清除');
}

// ── JSON export / import ─────────────────────────────────
export function exportData() {
  const blob = new Blob([JSON.stringify(exportSnapshot(), null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `fitfit-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  toast('✓ 已匯出備份檔');
}

export function triggerImport() {
  $('import-file').click();
}

async function handleImportFile(e) {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    importSnapshot(JSON.parse(await file.text()));
    bus.emit('state:changed');
    toast('✓ 資料已匯入');
  } catch (err) {
    toast(`匯入失敗：${err.message}`);
  }
}

// ── Google Drive ─────────────────────────────────────────
let driveBusy = false;

function saveClientIdFromInput() {
  setDriveClientId($('set-gdrive-id').value.trim());
}

function renderBackupStatus() {
  let last = '';
  try { last = localStorage.getItem(LAST_BACKUP_KEY) || ''; } catch { /* ignore */ }
  $('drive-status').textContent = last
    ? `上次備份：${new Date(last).toLocaleString('zh-TW')}`
    : '尚未備份過';
}

export async function driveBackup() {
  if (driveBusy) return;
  driveBusy = true;
  saveClientIdFromInput();
  toast('連線 Google Drive 中…');
  try {
    const modified = await backupToDrive(exportSnapshot());
    try { localStorage.setItem(LAST_BACKUP_KEY, modified || new Date().toISOString()); } catch { /* ignore */ }
    renderBackupStatus();
    toast('✓ 已備份到 Google Drive');
  } catch (err) {
    toast(err.message);
  }
  driveBusy = false;
}

export async function driveRestore() {
  if (driveBusy) return;
  if (!window.confirm('從 Google Drive 還原會覆蓋目前裝置上的資料，確定？')) return;
  driveBusy = true;
  saveClientIdFromInput();
  toast('連線 Google Drive 中…');
  try {
    importSnapshot(await restoreFromDrive());
    bus.emit('state:changed');
    toast('✓ 已從 Google Drive 還原');
  } catch (err) {
    toast(err.message);
  }
  driveBusy = false;
}
