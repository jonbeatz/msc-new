#!/usr/bin/env node

import './lib/msc-load-env.mjs';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const DEFAULT_BACKUP_ROOT = 'G:\\Cursor_Project_BackUpz';
const STANDARD_DIRS = ['node_modules', '.next', 'logs', 'test-results'];
const NOTES_REL_PATH = path.join('.cursor', 'BackUp-Notez.md');
const NOTES_FOOTER =
  '\n*Backup created — includes source code, config, and portable modules.*\n';

const rawArgs = process.argv.slice(2);
const noteFlagIndex = rawArgs.findIndex((a) => a === '--note' || a === '-n');
const userNoteFromCli = noteFlagIndex !== -1 ? (rawArgs[noteFlagIndex + 1] || '').trim() : '';
const args =
  noteFlagIndex === -1
    ? rawArgs
    : rawArgs.filter((_, i) => i !== noteFlagIndex && i !== noteFlagIndex + 1);

const isFullBackup = args.includes('--full') || args.includes('-f');
const isStandardBackup = args.includes('--standard') || args.includes('-s');
const skipConfirm = args.includes('--yes') || args.includes('-y');
const customName = args.find((a) => !a.startsWith('-')) || null;

function getProjectName() {
  try {
    const pkgPath = path.join(REPO_ROOT, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.name && typeof pkg.name === 'string') {
        return pkg.name.replace(/^@/, '').replace(/\//g, '-');
      }
    }
  } catch {
    /* use folder name */
  }
  return path.basename(REPO_ROOT);
}

function defaultBackupFolder(projectName) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  return `${projectName}-backup-${stamp}`;
}

function displayBackupType(backupType) {
  return backupType === 'FULL' ? 'Full' : 'Standard';
}

function escapeTableCell(text) {
  return String(text).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();
}

function getGitInfo(repoRoot) {
  try {
    const branch = execSync('git branch --show-current', {
      cwd: repoRoot,
      encoding: 'utf8',
    }).trim();
    const commit = execSync('git rev-parse --short HEAD', {
      cwd: repoRoot,
      encoding: 'utf8',
    }).trim();
    const message = execSync('git log -1 --pretty=%B', {
      cwd: repoRoot,
      encoding: 'utf8',
    })
      .trim()
      .split('\n')[0];
    return { branch, commit, message };
  } catch {
    return { branch: 'unknown', commit: 'unknown', message: 'unknown' };
  }
}

function formatExcluded(backupType) {
  if (backupType === 'FULL') {
    return 'None (full backup)';
  }
  return STANDARD_DIRS.map((d) => `${d}/`).join(', ');
}

function formatIncluded(backupType) {
  if (backupType === 'FULL') {
    return 'Full mirror (all project files)';
  }
  return '.env.local';
}

function buildNoteEntry({ timestamp, backupType, userNotes, gitInfo, backupFolder }) {
  const typeLabel = displayBackupType(backupType);
  let entry = `## [${timestamp}] - ${typeLabel} Backup\n\n`;

  if (userNotes?.trim()) {
    entry += `**My Notes:** ${userNotes.trim()}\n\n---\n\n`;
  } else {
    entry += `---\n\n`;
  }

  entry += `| Field | Value |\n`;
  entry += `|-------|-------|\n`;
  entry += `| **Folder** | ${escapeTableCell(backupFolder)} |\n`;
  entry += `| **Branch** | ${escapeTableCell(gitInfo.branch)} |\n`;
  entry += `| **Commit** | ${escapeTableCell(gitInfo.commit)} |\n`;
  entry += `| **Message** | ${escapeTableCell(gitInfo.message)} |\n`;
  entry += `| **Type** | ${typeLabel} |\n`;
  entry += `| **Excluded** | ${escapeTableCell(formatExcluded(backupType))} |\n`;
  entry += `| **Included (secrets)** | ${escapeTableCell(formatIncluded(backupType))} |\n`;
  entry += `\n---\n\n`;

  return entry;
}

function prependBackupNote(backupPath, entry, preservedTail = '') {
  const notesPath = path.join(backupPath, NOTES_REL_PATH);
  const notesDir = path.dirname(notesPath);

  if (!fs.existsSync(notesDir)) {
    fs.mkdirSync(notesDir, { recursive: true });
  }

  let tail = preservedTail;
  if (!tail && fs.existsSync(notesPath)) {
    tail = fs.readFileSync(notesPath, 'utf8');
  }

  if (!tail.includes('*Backup created — includes source code')) {
    tail = tail + NOTES_FOOTER;
  }

  fs.writeFileSync(notesPath, entry + tail, 'utf8');
  return notesPath;
}

function readExistingNotesBody(backupPath) {
  const notesPath = path.join(backupPath, NOTES_REL_PATH);
  if (!fs.existsSync(notesPath)) {
    return '';
  }
  let content = fs.readFileSync(notesPath, 'utf8');
  const legacyFooterIdx = content.indexOf('\n# Backup Notes\n');
  if (legacyFooterIdx !== -1) {
    content = content.slice(0, legacyFooterIdx);
  }
  const footerIdx = content.indexOf('\n*Backup created — includes source code');
  if (footerIdx !== -1) {
    content = content.slice(0, footerIdx);
  }
  const trimmed = content.trimEnd();
  return trimmed ? `${trimmed}\n\n` : '';
}

function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function createReadline() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

async function resolveBackupPlan(rl) {
  const projectName = getProjectName();
  const suggestedFolder = customName || defaultBackupFolder(projectName);

  let backupRoot = process.env.MSC_BACKUP_ROOT?.trim() || '';
  let backupFolder = customName || '';
  const interactive = process.stdin.isTTY;

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  📦 Portable Backup System                                   ║
╚══════════════════════════════════════════════════════════════╝

Current project: ${projectName}
Source: ${REPO_ROOT}
`);

  if (interactive) {
    if (!backupRoot) {
      const answer = await askQuestion(rl, `Backup drive/folder [${DEFAULT_BACKUP_ROOT}]: `);
      backupRoot = answer.trim() || DEFAULT_BACKUP_ROOT;
    } else {
      console.log(`Backup root (from MSC_BACKUP_ROOT): ${backupRoot}`);
    }

    if (!backupFolder) {
      const folderAnswer = await askQuestion(rl, `Backup folder name [${suggestedFolder}]: `);
      backupFolder = folderAnswer.trim() || suggestedFolder;
    }
  } else {
    backupRoot = backupRoot || DEFAULT_BACKUP_ROOT;
    backupFolder = backupFolder || suggestedFolder;
    console.log(`Backup root: ${backupRoot}`);
    console.log(`Backup folder: ${backupFolder}`);
  }

  const fullBackupPath = path.join(backupRoot, backupFolder);
  const backupType = isFullBackup ? 'FULL' : 'STANDARD';

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📂 Source:      ${REPO_ROOT}
📂 Destination: ${fullBackupPath}
📦 Type:        ${backupType}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  if (interactive && !skipConfirm) {
    const confirm = await askQuestion(rl, 'Proceed with backup? (y/n): ');
    if (confirm.trim().toLowerCase() !== 'y') {
      console.log('\n❌ Backup cancelled.');
      return null;
    }
  } else if (!interactive && !skipConfirm) {
    console.log('\nNon-interactive session: add --yes to run, or run from a terminal for prompts.');
    return null;
  }

  let userNotes = userNoteFromCli;
  if (interactive && !userNotes) {
    userNotes = await askQuestion(
      rl,
      '\n📝 Add a short note about this backup (optional, press Enter to skip): ',
    );
    userNotes = userNotes.trim();
  }

  return { fullBackupPath, backupFolder, backupType, userNotes };
}

function printSuccess(fullBackupPath, backupType, backupFolder, notesPath) {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Backup complete!
📂 Location: ${fullBackupPath}
📦 Type: ${backupType}
📝 Notes:   ${notesPath}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
  console.log(`Folder: ${backupFolder}`);
}

async function main() {
  const rl = createReadline();

  try {
    const plan = await resolveBackupPlan(rl);
    if (!plan) {
      return;
    }

    const { fullBackupPath, backupFolder, backupType, userNotes } = plan;

    if (!fs.existsSync(fullBackupPath)) {
      fs.mkdirSync(fullBackupPath, { recursive: true });
    }

    let cmd = `robocopy "${REPO_ROOT}" "${fullBackupPath}" /MIR`;

    if (isStandardBackup || (!isFullBackup && !isStandardBackup)) {
      cmd += ` /XD ${STANDARD_DIRS.join(' ')}`;
      console.log(
        'ℹ️  Standard skips: node_modules, .next, logs, test-results\n',
      );
      console.log('ℹ️  Keep backup destination private (.env.local is copied).\n');
    } else {
      console.log('ℹ️  Full backup: no directory skips (includes node_modules, .next)\n');
    }

    console.log('📦 Creating backup...\n');

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const gitInfo = getGitInfo(REPO_ROOT);
    const noteEntry = buildNoteEntry({
      timestamp,
      backupType,
      userNotes,
      gitInfo,
      backupFolder,
    });
    const preservedNotes = readExistingNotesBody(fullBackupPath);

    let robocopyOk = false;

    try {
      execSync(cmd, { stdio: 'inherit', shell: 'powershell.exe' });
      robocopyOk = true;
    } catch (error) {
      if (error.status === 1) {
        robocopyOk = true;
      } else {
        console.error(`\n❌ Backup failed: ${error.message}`);
        process.exit(1);
      }
    }

    if (robocopyOk) {
      const notesPath = prependBackupNote(fullBackupPath, noteEntry, preservedNotes);
      printSuccess(fullBackupPath, backupType, backupFolder, notesPath);
    }
  } finally {
    rl.close();
  }
}

main();
